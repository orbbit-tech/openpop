import hre from 'hardhat'

const DEPOSIT_AMOUNT = 5_000_000n // 5 USDC at 6 decimals — get this from Arc faucet first

const ERC20_ABI = [
  'function approve(address spender, uint256 amount) returns (bool)',
  'function balanceOf(address account) view returns (uint256)',
]

async function main() {
  const escrowAddress = process.env.PROOF_GATED_ESCROW_ADDRESS
  const recipientAddress = process.env.RECIPIENT_ADDRESS
  const usdcAddress = process.env.USDC_ADDRESS
  if (!escrowAddress) throw new Error('PROOF_GATED_ESCROW_ADDRESS not set')
  if (!recipientAddress) throw new Error('RECIPIENT_ADDRESS not set')
  if (!usdcAddress) throw new Error('USDC_ADDRESS not set')

  const conn = await hre.network.getOrCreate()
  const [signer] = await conn.ethers.getSigners()

  const usdc = new conn.ethers.Contract(usdcAddress, ERC20_ABI, signer)
  const balance = await usdc.balanceOf(signer.address)
  console.log(`USDC balance: ${balance}`)
  if (balance < DEPOSIT_AMOUNT) throw new Error(`Insufficient USDC — need ${DEPOSIT_AMOUNT}, have ${balance}. Get more from the Arc faucet.`)

  const escrow = await conn.ethers.getContractAt('ProofGatedEscrow', escrowAddress, signer)

  const tx1 = await escrow.createDeal(recipientAddress)
  await tx1.wait()
  console.log('Deal created. DEAL_ID=1')

  const approveTx = await usdc.approve(escrowAddress, DEPOSIT_AMOUNT)
  await approveTx.wait()

  const tx2 = await escrow.deposit(1, DEPOSIT_AMOUNT)
  await tx2.wait()
  console.log(`Deposited ${DEPOSIT_AMOUNT} USDC into deal 1`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
