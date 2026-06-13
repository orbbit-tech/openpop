import { ethers } from 'hardhat'

const DEPOSIT_AMOUNT = 50_000_000_000n // 50k USDC at 6 decimals

async function main() {
  const escrowAddress = process.env.PROOF_GATED_ESCROW_ADDRESS
  const recipientAddress = process.env.RECIPIENT_ADDRESS
  const usdcAddress = process.env.USDC_ADDRESS
  if (!escrowAddress) throw new Error('PROOF_GATED_ESCROW_ADDRESS not set')
  if (!recipientAddress) throw new Error('RECIPIENT_ADDRESS not set')
  if (!usdcAddress) throw new Error('USDC_ADDRESS not set')

  const escrow = await ethers.getContractAt('ProofGatedEscrow', escrowAddress)
  const usdc = await ethers.getContractAt('MockERC20', usdcAddress)

  const tx1 = await escrow.createDeal(recipientAddress)
  await tx1.wait()
  console.log('Deal created')

  const approveTx = await usdc.approve(escrowAddress, DEPOSIT_AMOUNT)
  await approveTx.wait()

  const tx2 = await escrow.deposit(1, DEPOSIT_AMOUNT)
  await tx2.wait()

  console.log('DEAL_ID=1')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
