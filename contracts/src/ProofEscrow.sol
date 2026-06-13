// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IKeystoneForwarder {
    function verify(bytes calldata data) external view returns (bool);
}

contract ProofEscrow {
    // ── State ────────────────────────────────────────────────────────────────

    enum State { AWAITING_DEPOSIT, FUNDED, RELEASED, REJECTED }

    IERC20 public immutable usdc;
    IKeystoneForwarder public immutable forwarder;
    address public immutable recipient;
    uint256 public immutable scoreThreshold;

    State public state;

    // ── Events ───────────────────────────────────────────────────────────────

    event Funded(address indexed depositor, uint256 amount);
    event Released(address indexed recipient, uint256 amount);
    event Rejected(string reason);

    // ── Constructor ──────────────────────────────────────────────────────────

    constructor(
        address usdc_,
        address forwarder_,
        address recipient_,
        uint256 scoreThreshold_
    ) {
        usdc = IERC20(usdc_);
        forwarder = IKeystoneForwarder(forwarder_);
        recipient = recipient_;
        scoreThreshold = scoreThreshold_;
        state = State.AWAITING_DEPOSIT;
    }

    // ── External functions ───────────────────────────────────────────────────

    /// @notice Lock USDC into the escrow. Can only be called once.
    function depositUSDC(uint256 amount) external {
        require(state == State.AWAITING_DEPOSIT, "ProofEscrow: not awaiting deposit");
        state = State.FUNDED;
        require(
            usdc.transferFrom(msg.sender, address(this), amount),
            "ProofEscrow: transfer failed"
        );
        emit Funded(msg.sender, amount);
    }

    /// @notice Submit a signed receipt from the verification pipeline.
    ///         Releases USDC to recipient if proof is valid and policy passes,
    ///         otherwise locks funds and records the rejection reason.
    function submitProof(
        bool compliant,
        uint256 score,
        bytes calldata sig
    ) external {
        require(state == State.FUNDED, "ProofEscrow: funds not locked");

        bool valid = forwarder.verify(abi.encode(compliant, score, sig));
        require(valid, "ProofEscrow: invalid signature");

        _checkPolicy(compliant, score);
    }

    // ── Internal helpers ─────────────────────────────────────────────────────

    function _checkPolicy(bool compliant, uint256 score) internal {
        if (compliant && score >= scoreThreshold) {
            _release();
        } else {
            if (!compliant) {
                _reject("compliance failed");
            } else {
                _reject("score below threshold");
            }
        }
    }

    function _release() internal {
        uint256 amount = usdc.balanceOf(address(this));
        state = State.RELEASED;
        require(usdc.transfer(recipient, amount), "ProofEscrow: release failed");
        emit Released(recipient, amount);
    }

    function _reject(string memory reason) internal {
        state = State.REJECTED;
        emit Rejected(reason);
    }
}
