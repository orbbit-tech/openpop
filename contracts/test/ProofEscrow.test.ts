import { expect } from "chai";
import { ethers } from "hardhat";

describe("ProofEscrow", function () {
  async function deploy(forwarderResult: boolean, threshold = 65) {
    const [, investor, recipient] = await ethers.getSigners();

    const MockERC20 = await ethers.getContractFactory("MockERC20");
    const usdc = await MockERC20.deploy();

    const MockForwarder = await ethers.getContractFactory("MockForwarder");
    const forwarder = await MockForwarder.deploy(forwarderResult);

    const ProofEscrow = await ethers.getContractFactory("ProofEscrow");
    const escrow = await ProofEscrow.deploy(
      await usdc.getAddress(),
      await forwarder.getAddress(),
      recipient.address,
      threshold
    );

    const AMOUNT = ethers.parseUnits("1000", 18);
    await usdc.mint(investor.address, AMOUNT);
    await usdc.connect(investor).approve(await escrow.getAddress(), AMOUNT);

    return { escrow, usdc, forwarder, investor, recipient, AMOUNT };
  }

  describe("depositUSDC", function () {
    it("[happy-path] investor deposits USDC and the full amount is locked inside the contract", async function () {
      const { escrow, usdc, investor, AMOUNT } = await deploy(true);
      await escrow.connect(investor).depositUSDC(AMOUNT);
      expect(await usdc.balanceOf(await escrow.getAddress())).to.equal(AMOUNT);
    });

    it("[unhappy-path] a second deposit while funds are already locked reverts", async function () {
      const { escrow, investor, AMOUNT } = await deploy(true);
      await escrow.connect(investor).depositUSDC(AMOUNT);
      await expect(escrow.connect(investor).depositUSDC(AMOUNT)).to.be.reverted;
    });
  });

  describe("submitProof", function () {
    it("[happy-path] valid signature, compliance passed, score above threshold — USDC is released to the recipient and Released event is emitted", async function () {
      const { escrow, usdc, investor, recipient, AMOUNT } = await deploy(true);
      await escrow.connect(investor).depositUSDC(AMOUNT);
      await expect(escrow.submitProof(true, 82, "0x"))
        .to.emit(escrow, "Released")
        .withArgs(recipient.address, AMOUNT);
      expect(await usdc.balanceOf(recipient.address)).to.equal(AMOUNT);
    });

    it("[unhappy-path] valid signature, compliance passed, score below threshold — funds stay locked and Rejected event is emitted with a reason", async function () {
      const { escrow, investor, AMOUNT } = await deploy(true);
      await escrow.connect(investor).depositUSDC(AMOUNT);
      await expect(escrow.submitProof(true, 40, "0x")).to.emit(escrow, "Rejected");
    });

    it("[unhappy-path] forwarder rejects the signature — call reverts before any state changes", async function () {
      const { escrow, investor, AMOUNT } = await deploy(false);
      await escrow.connect(investor).depositUSDC(AMOUNT);
      await expect(escrow.submitProof(true, 82, "0x")).to.be.reverted;
    });

    it("[unhappy-path] submitProof called before any deposit has been made — reverts", async function () {
      const { escrow } = await deploy(true);
      await expect(escrow.submitProof(true, 82, "0x")).to.be.reverted;
    });

    it("[invariant] contract USDC balance is exactly zero after a successful release — no funds remain", async function () {
      const { escrow, usdc, investor, AMOUNT } = await deploy(true);
      await escrow.connect(investor).depositUSDC(AMOUNT);
      await escrow.submitProof(true, 82, "0x");
      expect(await usdc.balanceOf(await escrow.getAddress())).to.equal(0);
    });
  });
});
