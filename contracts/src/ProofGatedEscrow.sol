// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ReceiverTemplate} from "./interfaces/ReceiverTemplate.sol";

/**
 * @title ProofGatedEscrow
 * @notice Holds USDC for multiple deals and releases funds to the recipient only when a
 *         Chainlink CRE-signed receipt is delivered by the trusted Keystone Forwarder.
 *
 * @dev State machine per deal: AWAITING_DEPOSIT → FUNDED → RELEASED
 *                                                       └→ REJECTED
 *
 *      The contract is a pure proof-gated vault. Policy evaluation (compliance thresholds,
 *      underwriting scores) belongs in the CRE workflow that produces the signed receipt —
 *      not here. The contract's only question: did the Chainlink network sign off on this?
 *
 *      Implements IReceiver.onReport — the Keystone Forwarder is the sole caller authorised
 *      to deliver results. Access control is enforced by the ReceiverTemplate onlyForwarder
 *      modifier; no signature verification is needed inside this contract.
 *
 *      One contract handles every deal via a mapping — deploying a new contract per deal
 *      is not required.
 */
contract ProofGatedEscrow is ReceiverTemplate {
    // ── Enums ─────────────────────────────────────────────────────────────────

    /**
     * @notice Lifecycle state of a deal.
     *
     * @dev AWAITING_DEPOSIT — deal registered, no funds locked yet.
     *      FUNDED           — investor's USDC locked in this contract.
     *      RELEASED         — terminal; proof approved, USDC transferred to recipient.
     *      REJECTED         — terminal; proof rejected, USDC stays locked.
     */
    enum State { AWAITING_DEPOSIT, FUNDED, RELEASED, REJECTED }

    // ── Structs ───────────────────────────────────────────────────────────────

    /**
     * @notice On-chain record of a deal.
     *
     * @param recipient Address that receives USDC when proof is approved.
     * @param amount    USDC locked by the investor. Stored here rather than read from
     *                  balanceOf so that a release only moves funds for this deal and
     *                  not funds belonging to other deals held by the same contract.
     * @param state     Current lifecycle state.
     */
    struct Deal {
        address recipient;
        uint256 amount;
        State state;
    }

    // ── State ─────────────────────────────────────────────────────────────────

    /// @notice USDC token this contract holds and releases.
    IERC20 public immutable usdc;

    /// @notice Deals keyed by their on-chain ID.
    mapping(uint256 => Deal) public deals;

    /// @notice The next deal ID to assign. Starts at 1 — 0 is the zero value for an uninitialised deal.
    uint256 public nextDealId;

    // ── Events ────────────────────────────────────────────────────────────────

    /**
     * @notice Emitted when a deal is registered.
     * @param dealId    The newly assigned deal identifier.
     * @param recipient Address that will receive USDC if proof is approved.
     */
    event DealCreated(uint256 indexed dealId, address indexed recipient);

    /**
     * @notice Emitted when an investor locks USDC into a deal.
     * @param dealId    The funded deal.
     * @param depositor Address that transferred USDC.
     * @param amount    Amount locked.
     */
    event Deposited(uint256 indexed dealId, address indexed depositor, uint256 amount);

    /**
     * @notice Emitted when proof is approved and USDC is sent to the recipient.
     * @param dealId    The settled deal.
     * @param recipient Address that received USDC.
     * @param amount    Amount released.
     */
    event Released(uint256 indexed dealId, address indexed recipient, uint256 amount);

    /**
     * @notice Emitted when proof is rejected and funds remain locked.
     * @param dealId The rejected deal.
     */
    event Rejected(uint256 indexed dealId);

    // ── Constructor ───────────────────────────────────────────────────────────

    constructor(address usdc_, address forwarder_) ReceiverTemplate(forwarder_) {
        usdc = IERC20(usdc_);
        nextDealId = 1;
    }

    // ── External functions ────────────────────────────────────────────────────

    /**
     * @notice Registers a new deal and returns its ID. No funds move here.
     * @param recipient Address that receives USDC when proof is approved.
     * @return dealId Unique identifier for this deal, used in all subsequent calls.
     */
    function createDeal(address recipient) external returns (uint256 dealId) {
        require(recipient != address(0), "ProofGatedEscrow: zero recipient");
        dealId = nextDealId++;
        deals[dealId] = Deal({
            recipient: recipient,
            amount: 0,
            state: State.AWAITING_DEPOSIT
        });
        emit DealCreated(dealId, recipient);
    }

    /**
     * @notice Locks USDC into the escrow for a specific deal. Can only be called once per deal.
     * @param dealId  The deal to fund.
     * @param amount  USDC amount to lock.
     */
    function deposit(uint256 dealId, uint256 amount) external {
        Deal storage deal = deals[dealId];
        require(deal.state == State.AWAITING_DEPOSIT, "ProofGatedEscrow: not awaiting deposit");

        /*
         * State change before the transfer — prevents reentrancy if the token
         * calls back into this function during transferFrom.
         */
        deal.state = State.FUNDED;
        deal.amount = amount;
        require(usdc.transferFrom(msg.sender, address(this), amount), "ProofGatedEscrow: transfer failed");
        emit Deposited(dealId, msg.sender, amount);
    }

    /**
     * @notice Receives a Chainlink Keystone report and either releases funds to the recipient
     *         or marks the deal as rejected.
     * @dev    Called exclusively by the Keystone Forwarder (enforced via onlyForwarder).
     *         The report bytes are ABI-decoded as (uint256 dealId, bool approved).
     * @param report ABI-encoded (uint256 dealId, bool approved) verdict from the CRE workflow.
     */
    function onReport(bytes calldata /* metadata */, bytes calldata report) external override onlyForwarder {
        (uint256 dealId, bool approved) = abi.decode(report, (uint256, bool));
        Deal storage deal = deals[dealId];
        require(deal.state == State.FUNDED, "ProofGatedEscrow: funds not locked");

        if (approved) {
            _release(dealId, deal);
        } else {
            _reject(dealId);
        }
    }

    // ── Internal helpers ──────────────────────────────────────────────────────

    function _release(uint256 dealId, Deal storage deal) internal {
        uint256 amount = deal.amount;
        address recipient = deal.recipient;
        deal.state = State.RELEASED;
        require(usdc.transfer(recipient, amount), "ProofGatedEscrow: release failed");
        emit Released(dealId, recipient, amount);
    }

    function _reject(uint256 dealId) internal {
        deals[dealId].state = State.REJECTED;
        emit Rejected(dealId);
    }
}
