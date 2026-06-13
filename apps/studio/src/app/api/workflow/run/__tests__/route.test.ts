import { describe, it, expect, beforeEach, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { spawnSync } from 'node:child_process'
import { writeFileSync } from 'node:fs'
import type { Receipt } from '../../../../../types/receipt'

vi.mock('node:child_process')
vi.mock('node:fs')

const { POST } = await import('../route')

// ── fixtures ──────────────────────────────────────────────────────────────────

const creResult = {
  invoiceId: 'INV-001',
  businessName: 'Gallivant Ice Cream',
  compliance: { kyc: 'pass', kyb: 'pass', sanctions: 'clean' },
  dairyPrice: { price: 2.34, unit: 'per lb' },
  underwriting: { score: 82, approved: true, maxAdvanceUsdc: 42500 },
  verdict: 'approved',
  timestamp: '2026-06-13T14:32:00Z',
}

function buildReceipt(overrides: Partial<Receipt> = {}): Receipt {
  return {
    companyName: 'Gallivant Ice Cream',
    invoiceAmount: '$50,000 · Walmart Net-30',
    compliant: true,
    score: 82,
    approved: true,
    confidence: 91,
    dairyPrice: 2.34,
    txHash: '0xMOCK_TX',
    signature: '0xMOCK_SIG',
    timestamp: '2026-06-13T14:32:00Z',
    prover: 'CRE / BFT Consensus',
    consensus: { agreed: 7, total: 9 },
    blockNumber: 9910,
    steps: [
      { label: 'Compliance Check', status: 'completed', metadata: 'KYC pass · KYB pass · OFAC clean' },
      { label: 'Dairy Price Oracle', status: 'completed', metadata: 'USDA cream $2.34/lb · x402 paid' },
      { label: 'Underwriting Decision', status: 'completed', metadata: 'Score 82 · Approved' },
    ],
    ...overrides,
  }
}

function makeRequest(): NextRequest {
  return new NextRequest('http://localhost/api/workflow/run', { method: 'POST' })
}

// ── tests ─────────────────────────────────────────────────────────────────────

describe('POST /api/workflow/run', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('CRE exits 0 → returns 200 with Receipt shaped from CRE stdout', async () => {
    vi.mocked(spawnSync).mockReturnValue({ status: 0, stdout: JSON.stringify(creResult) } as any)

    const res = await POST(makeRequest())
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.receipt.companyName).toBe('Gallivant Ice Cream')
    expect(body.receipt.dairyPrice).toBe(2.34)
    expect(body.receipt.score).toBe(82)
    expect(body.receipt.approved).toBe(true)
  })

  it('compliant is true when kyc=pass, kyb=pass, sanctions=clean', async () => {
    vi.mocked(spawnSync).mockReturnValue({ status: 0, stdout: JSON.stringify(creResult) } as any)

    const res = await POST(makeRequest())
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.receipt.compliant).toBe(true)
  })

  it('compliant is false when any compliance field deviates from passing value', async () => {
    const failingResult = {
      ...creResult,
      compliance: { kyc: 'fail', kyb: 'pass', sanctions: 'clean' },
    }
    vi.mocked(spawnSync).mockReturnValue({ status: 0, stdout: JSON.stringify(failingResult) } as any)

    const res = await POST(makeRequest())
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.receipt.compliant).toBe(false)
  })

  it('approved reflects underwriting.approved from CRE stdout', async () => {
    const rejectedResult = {
      ...creResult,
      underwriting: { score: 40, approved: false, maxAdvanceUsdc: 0 },
    }
    vi.mocked(spawnSync).mockReturnValue({ status: 0, stdout: JSON.stringify(rejectedResult) } as any)

    const res = await POST(makeRequest())
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.receipt.approved).toBe(false)
  })

  it('CRE exits non-zero → returns 500 and writeFileSync is not called', async () => {
    vi.mocked(spawnSync).mockReturnValue({ status: 1, stdout: '' } as any)

    const res = await POST(makeRequest())

    expect(res.status).toBe(500)
    expect(vi.mocked(writeFileSync)).not.toHaveBeenCalled()
  })

  it('CRE stdout is not valid JSON → returns 500 and writeFileSync is not called', async () => {
    vi.mocked(spawnSync).mockReturnValue({ status: 0, stdout: 'not valid json' } as any)

    const res = await POST(makeRequest())

    expect(res.status).toBe(500)
    expect(vi.mocked(writeFileSync)).not.toHaveBeenCalled()
  })
})
