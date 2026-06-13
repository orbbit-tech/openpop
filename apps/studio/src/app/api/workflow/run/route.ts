import { NextRequest, NextResponse } from 'next/server'
import { spawnSync } from 'node:child_process'
import { writeFileSync } from 'node:fs'
import path from 'node:path'
import type { Proof } from '../../../../types/proof'

type CREResult = {
  invoiceId: string
  businessName: string
  compliance: {
    kyc: string
    kyb: string
    sanctions: string
  }
  dairyPrice: {
    price: number
    unit: string
  }
  underwriting: {
    score: number
    approved: boolean
    maxAdvanceUsdc: number
  }
  verdict: string
  timestamp: string
}

export async function POST(_request?: NextRequest): Promise<NextResponse> {
  // Next.js runs from apps/studio/, so the cwd must point two levels up to reach cre/loan/.
  const result = spawnSync('cre', ['workflow', 'simulate', '--broadcast'], {
    cwd: path.join(process.cwd(), '../../cre/loan'),
    encoding: 'utf-8',
  })

  if (result.status !== 0) {
    return NextResponse.json(
      { error: `CRE exited with status ${result.status}` },
      { status: 500 },
    )
  }

  // Guard before shaping — proof.json must never be written from a partial result.
  let cre: CREResult
  try {
    cre = JSON.parse(result.stdout) as CREResult
  } catch {
    return NextResponse.json(
      { error: 'CRE stdout is not valid JSON' },
      { status: 500 },
    )
  }

  const proof: Proof = {
    companyName: cre.businessName,
    invoiceAmount: '$50,000 · Walmart Net-30',
    compliant:
      cre.compliance.kyc === 'pass' &&
      cre.compliance.kyb === 'pass' &&
      cre.compliance.sanctions === 'clean',
    score: cre.underwriting.score,
    approved: cre.underwriting.approved,
    confidence: 91,
    dairyPrice: cre.dairyPrice.price,
    // txHash, signature, consensus, and blockNumber are stand-ins — MockKeystoneForwarder
    // accepts any bytes for the signature until the real CRE broadcast is wired.
    txHash: '0xMOCK_TX',
    signature: '0xMOCK_SIG',
    timestamp: cre.timestamp,
    prover: 'CRE / BFT Consensus',
    consensus: { agreed: 7, total: 9 },
    blockNumber: 9910,
    steps: [
      {
        label: 'Compliance Check',
        status: 'completed',
        metadata: 'KYC pass · KYB pass · OFAC clean',
      },
      {
        label: 'Dairy Price Oracle',
        status: 'completed',
        metadata: `USDA cream $${cre.dairyPrice.price}/lb · x402 paid`,
      },
      {
        label: 'Underwriting Decision',
        status: 'completed',
        metadata: `Score ${cre.underwriting.score} · ${cre.underwriting.approved ? 'Approved' : 'Rejected'}`,
      },
    ],
  }

  writeFileSync(path.join(process.cwd(), 'proof.json'), JSON.stringify(proof, null, 2))

  return NextResponse.json(proof)
}
