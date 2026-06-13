import { describe, it, expect, beforeEach, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { readFile } from 'fs/promises'
import type { Receipt } from '../../../../types/receipt'

vi.mock('fs/promises')

const { GET } = await import('../route')

// ── fixtures ──────────────────────────────────────────────────────────────────

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
  return new NextRequest('http://localhost/api/proof')
}

// ── tests ─────────────────────────────────────────────────────────────────────

describe('GET /api/proof', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('proof.json exists → returns 200 with the full Receipt object', async () => {
    const receipt = buildReceipt()
    vi.mocked(readFile).mockResolvedValue(JSON.stringify(receipt) as any)

    const res = await GET(makeRequest())
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.companyName).toBe('Gallivant Ice Cream')
    expect(body.approved).toBe(true)
    expect(body.score).toBe(82)
  })

  it('proof.json does not exist (ENOENT) → returns 404 with error message', async () => {
    const err = Object.assign(new Error('ENOENT: no such file'), { code: 'ENOENT' })
    vi.mocked(readFile).mockRejectedValue(err)

    const res = await GET(makeRequest())
    const body = await res.json()

    expect(res.status).toBe(404)
    expect(body.error).toBe('no proof found')
  })

  it('proof.json contains invalid JSON → returns 500', async () => {
    vi.mocked(readFile).mockResolvedValue('not valid json' as any)

    const res = await GET(makeRequest())

    expect(res.status).toBe(500)
  })
})
