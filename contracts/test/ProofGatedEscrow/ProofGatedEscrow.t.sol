// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {ProofGatedEscrow} from "../../contracts/ProofGatedEscrow.sol";
import {MockERC20, MockForwarder} from "../helpers/ProofGatedEscrowMocks.sol";

// ── Base ──────────────────────────────────────────────────────────────────────

contract ProofGatedEscrowTest is Test {
    ProofGatedEscrow internal escrow;
    MockERC20 internal usdc;
    MockForwarder internal forwarder;

    address internal investor = makeAddr("investor");
    address internal recipient = makeAddr("recipient");

    uint256 internal constant AMOUNT = 1_000e18;
    uint256 internal constant DEAL_ID = 1;

    function setUp() public virtual {
        usdc = new MockERC20();
        forwarder = new MockForwarder(true);
        escrow = new ProofGatedEscrow(address(usdc), address(forwarder));
        escrow.createDeal(recipient);
        usdc.mint(investor, AMOUNT);
        vm.prank(investor);
        usdc.approve(address(escrow), AMOUNT);
    }
}

// ── createDeal ────────────────────────────────────────────────────────────────

contract ProofGatedEscrow_createDeal is ProofGatedEscrowTest {
    // [happy-path] deal is stored with correct fields and nextDealId increments
    function test_storesDealAndIncrementsId() public {
        uint256 id = escrow.createDeal(recipient);
        assertEq(id, 2); // DEAL_ID=1 was created in setUp
        assertEq(escrow.nextDealId(), 3);
        (address r,,) = escrow.deals(id);
        assertEq(r, recipient);
    }

    // [unhappy-path] zero recipient address reverts
    function test_revertsOnZeroRecipient() public {
        vm.expectRevert();
        escrow.createDeal(address(0));
    }
}

// ── deposit ───────────────────────────────────────────────────────────────────

contract ProofGatedEscrow_deposit is ProofGatedEscrowTest {
    // [happy-path] investor deposits USDC and the full amount is locked inside the contract
    function test_locksFullAmountForDeal() public {
        vm.prank(investor);
        escrow.deposit(DEAL_ID, AMOUNT);
        assertEq(usdc.balanceOf(address(escrow)), AMOUNT);
        (, uint256 stored,) = escrow.deals(DEAL_ID);
        assertEq(stored, AMOUNT);
    }

    // [unhappy-path] a second deposit on the same deal reverts
    function test_revertsIfAlreadyFunded() public {
        vm.prank(investor);
        escrow.deposit(DEAL_ID, AMOUNT);
        vm.prank(investor);
        vm.expectRevert();
        escrow.deposit(DEAL_ID, AMOUNT);
    }
}

// ── submitProof ───────────────────────────────────────────────────────────────

contract ProofGatedEscrow_submitProof is ProofGatedEscrowTest {
    function setUp() public override {
        super.setUp();
        vm.prank(investor);
        escrow.deposit(DEAL_ID, AMOUNT);
    }

    // [happy-path] valid signature, approved verdict — USDC released to recipient
    function test_releasesUsdcToRecipientAndEmitsReleased() public {
        vm.expectEmit(true, true, false, true);
        emit ProofGatedEscrow.Released(DEAL_ID, recipient, AMOUNT);
        escrow.submitProof(DEAL_ID, true, "");
        assertEq(usdc.balanceOf(recipient), AMOUNT);
    }

    // [unhappy-path] rejected verdict — funds stay locked and Rejected event emitted
    function test_emitsRejectedOnRejectedVerdict() public {
        vm.expectEmit(true, false, false, false);
        emit ProofGatedEscrow.Rejected(DEAL_ID);
        escrow.submitProof(DEAL_ID, false, "");
    }

    // [unhappy-path] forwarder rejects the signature — reverts before any state change
    function test_revertsIfForwarderRejectsSignature() public {
        MockForwarder badForwarder = new MockForwarder(false);
        ProofGatedEscrow badEscrow = new ProofGatedEscrow(address(usdc), address(badForwarder));
        badEscrow.createDeal(recipient);
        usdc.mint(investor, AMOUNT);
        vm.startPrank(investor);
        usdc.approve(address(badEscrow), AMOUNT);
        badEscrow.deposit(1, AMOUNT);
        vm.stopPrank();
        vm.expectRevert();
        badEscrow.submitProof(1, true, "");
    }

    // [unhappy-path] submitProof before any deposit reverts
    function test_revertsIfNoDepositMade() public {
        escrow.createDeal(recipient);
        vm.expectRevert();
        escrow.submitProof(2, true, "");
    }

    // [invariant] contract USDC balance is exactly zero after a successful release
    function test_contractBalanceIsZeroAfterRelease() public {
        escrow.submitProof(DEAL_ID, true, "");
        assertEq(usdc.balanceOf(address(escrow)), 0);
    }
}
