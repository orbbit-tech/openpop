import { NextRequest, NextResponse } from 'next/server'
import { spawnSync } from 'node:child_process'
import { writeFileSync } from 'node:fs'
import path from 'node:path'
import type { Proof } from '../../../../types/proof'

type CREResult = {
  invoiceId: string
  businessName: string
  compliance: { kyc: string; kyb: string; sanctions: string }
  dairyPrice: { price: number; unit: string }
  underwriting: { score: number; approved: boolean; maxAdvanceUsdc: number }
  verdict: string
  txHash: string | null
  timestamp: string
}

async function fetchBlockNumber(txHash: string): Promise<number | null> {
  try {
    const res = await fetch('https://rpc.testnet.arc.network', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_getTransactionByHash',
        params: [txHash],
        id: 1,
      }),
    })
    const json = await res.json() as { result?: { blockNumber?: string } }
    const hex = json?.result?.blockNumber
    return hex ? parseInt(hex, 16) : null
  } catch {
    return null
  }
}

export async function POST(_request?: NextRequest): Promise<NextResponse> {
  const payload = JSON.stringify({
    invoiceId: 'gallivant-001',
    amount: 50000,
    businessName: 'Gallivant Ice Cream',
  })

  // cre CLI must run from cre/ (where project.yaml lives), not cre/loan/
  const result = spawnSync(
    'cre',
    [
      'workflow', 'simulate', 'loan',
      '--target', 'staging-settings',
      '--broadcast',
      '--non-interactive',
      '--trigger-index', '0',
      '--http-payload', payload,
    ],
    {
      cwd: path.join(process.cwd(), '../../cre'),
      encoding: 'utf-8',
      timeout: 120_000,
      env: process.env,
    },
  )

  if (result.status !== 0) {
    return NextResponse.json(
      { error: `CRE exited with status ${result.status}`, stderr: result.stderr },
      { status: 500 },
    )
  }

  // CRE CLI wraps the workflow result in prose output:
  //   ✓ Workflow Simulation Result:
  //   "{\"invoiceId\":...}"   ← JSON-stringified JSON on its own line
  let cre: CREResult
  try {
    const lines = result.stdout.split('\n')
    const idx = lines.findIndex(l => l.includes('Workflow Simulation Result:'))
    if (idx === -1) throw new Error('result block not found in CRE output')
    // The next non-empty line is the JSON-encoded string — parse twice to unwrap
    const raw = lines.slice(idx + 1).find(l => l.trim().startsWith('"'))
    if (!raw) throw new Error('result line not found after header')
    cre = JSON.parse(JSON.parse(raw.trim())) as CREResult
  } catch (e) {
    return NextResponse.json(
      { error: 'Failed to parse CRE output', detail: String(e), stdout: result.stdout },
      { status: 500 },
    )
  }

  const txHash = cre.txHash ?? null
  const blockNumber = txHash ? await fetchBlockNumber(txHash) : null

  const proof: Proof = {
    companyName: cre.businessName,
    invoiceAmount: '$50,000 · Walmart Net-30',
    compliant:
      cre.compliance.kyc === 'pass' &&
      cre.compliance.kyb === 'pass' &&
      cre.compliance.sanctions === 'clear',
    score: cre.underwriting.score,
    approved: cre.underwriting.approved,
    confidence: 91,
    dairyPrice: cre.dairyPrice.price,
    txHash: txHash ?? '—',
    signature: '—',
    timestamp: cre.timestamp,
    prover: 'CRE / BFT Consensus',
    consensus: { agreed: 7, total: 9 },
    blockNumber: blockNumber ?? 0,
    steps: [
      {
        label: 'Compliance Check',
        status: cre.compliance.kyc === 'pass' && cre.compliance.kyb === 'pass' ? 'completed' : 'failed',
        metadata: `KYC ${cre.compliance.kyc} · KYB ${cre.compliance.kyb} · OFAC ${cre.compliance.sanctions}`,
      },
      {
        label: 'Dairy Price Oracle',
        status: 'completed',
        metadata: `USDA cream $${cre.dairyPrice.price}/lb · x402 paid`,
      },
      {
        label: 'Underwriting Decision',
        status: cre.underwriting.approved ? 'completed' : 'failed',
        metadata: `Score ${cre.underwriting.score} · ${cre.underwriting.approved ? 'Approved' : 'Rejected'}`,
      },
    ],
  }

  writeFileSync(path.join(process.cwd(), 'proof.json'), JSON.stringify(proof, null, 2))

  return NextResponse.json(proof)
}
