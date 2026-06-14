import { NextRequest, NextResponse } from 'next/server'
import { spawnSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { wrapFetchWithPayment } from 'x402-fetch'
import { DynamicEvmWalletClient } from '@dynamic-labs-wallet/node-evm'
import { baseSepolia } from 'viem/chains'
import type { Proof } from '../../../../types/proof'
import { getDealConfig } from '../../../../lib/deals'

type Body = { dealId: string; invoiceId: string }

async function fetchBlockNumber(txHash: string): Promise<number | null> {
  try {
    const res = await fetch('https://rpc.testnet.arc.network', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', method: 'eth_getTransactionByHash', params: [txHash], id: 1 }),
    })
    const json = await res.json() as { result?: { blockNumber?: string } }
    const hex = json?.result?.blockNumber
    return hex ? parseInt(hex, 16) : null
  } catch {
    return null
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const { dealId, invoiceId } = await request.json() as Body

  const onChainDealId = parseInt(dealId, 10)
  if (!Number.isFinite(onChainDealId) || onChainDealId < 1) {
    return NextResponse.json({ error: 'invalid dealId' }, { status: 400 })
  }

  // Patch config.staging.json with the investor's on-chain dealId
  const configPath = path.join(process.cwd(), '../../cre/invoice-financing/config.staging.json')
  let config: Record<string, unknown>
  try {
    config = JSON.parse(readFileSync(configPath, 'utf-8'))
  } catch {
    return NextResponse.json({ error: 'config.staging.json not found' }, { status: 500 })
  }
  config.dealId = onChainDealId
  writeFileSync(configPath, JSON.stringify(config, null, 2))

  // Fetch live dairy price via x402 before CRE runs
  let dairyPriceUsdPerLb: number | undefined
  try {
    const evmClient = new DynamicEvmWalletClient({
      environmentId: process.env.NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID!,
    })
    await evmClient.authenticateApiToken(process.env.DYNAMIC_AUTH_TOKEN!)
    const wallets = await evmClient.getEvmWallets()
    const walletClient = await evmClient.getWalletClient({
      walletMetadata: wallets[0],
      password: process.env.DYNAMIC_WALLET_PASSWORD!,
      chain: baseSepolia,
    })
    const fetchWithPayment = wrapFetchWithPayment(fetch, walletClient as Parameters<typeof wrapFetchWithPayment>[1])
    const res = await fetchWithPayment(process.env.DAIRY_PRICING_API_URL!)
    if (res.ok) {
      const data = await res.json() as { price: number; unit: string }
      dairyPriceUsdPerLb = data.price
    }
  } catch { /* non-fatal — CRE falls back to mock config value */ }

  const dealConfig = getDealConfig(invoiceId)
  const businessName = dealConfig?.businessName ?? 'Gallivant Ice Cream'
  const amount = dealConfig?.amount ?? 50_000

  // Run CRE with --broadcast — writeReport fires for the correct dealId
  const payload = JSON.stringify({
    invoiceId,
    amount,
    businessName,
    ...(dairyPriceUsdPerLb !== undefined && { dairyPriceUsdPerLb }),
  })
  const result = spawnSync(
    'cre',
    [
      'workflow', 'simulate', 'invoice-financing',
      '--target', 'staging-settings',
      '--broadcast',
      '--non-interactive',
      '--trigger-index', '0',
      '--http-payload', payload,
    ],
    { cwd: path.join(process.cwd(), '../../cre'), encoding: 'utf-8', timeout: 120_000, env: process.env },
  )

  if (result.status !== 0) {
    return NextResponse.json(
      { error: `CRE exited ${result.status}`, stderr: result.stderr },
      { status: 500 },
    )
  }

  // Parse txHash out of CRE output
  let txHash: string | null = null
  try {
    const lines = result.stdout.split('\n')
    const idx = lines.findIndex(l => l.includes('Workflow Simulation Result:'))
    if (idx !== -1) {
      const raw = lines.slice(idx + 1).find(l => l.trim().startsWith('"'))
      if (raw) {
        const parsed = JSON.parse(JSON.parse(raw.trim())) as { txHash?: string | null }
        txHash = parsed.txHash ?? null
      }
    }
  } catch { /* best-effort */ }

  const blockNumber = txHash ? await fetchBlockNumber(txHash) : null

  // Update the proof file with txHash and onChainDealId
  const proofPath = path.join(process.cwd(), 'proofs', `${invoiceId}.json`)
  try {
    const proof = JSON.parse(readFileSync(proofPath, 'utf-8')) as Proof
    if (txHash) proof.txHash = txHash
    if (blockNumber) proof.blockNumber = blockNumber
    proof.onChainDealId = onChainDealId
    writeFileSync(proofPath, JSON.stringify(proof, null, 2))
  } catch { /* proof may not exist yet — non-fatal */ }

  return NextResponse.json({ txHash, blockNumber, dealId: onChainDealId })
}
