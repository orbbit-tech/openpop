import hre from 'hardhat'

const MOCK_KEYSTONE_FORWARDER = '0x6E9EE680ef59ef64Aa8C7371279c27E496b5eDc1'

async function main() {
  const usdcAddress = process.env.USDC_ADDRESS
  if (!usdcAddress) throw new Error('USDC_ADDRESS not set')

  const conn = await hre.network.getOrCreate()
  const [deployer] = await conn.ethers.getSigners()
  console.log('Deploying from:', deployer.address)

  const Escrow = await conn.ethers.getContractFactory('ProofGatedEscrow')
  const escrow = await Escrow.deploy(usdcAddress, MOCK_KEYSTONE_FORWARDER)
  await escrow.waitForDeployment()

  console.log(`PROOF_GATED_ESCROW_ADDRESS=${await escrow.getAddress()}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
