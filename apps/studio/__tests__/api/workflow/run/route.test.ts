import { describe, it, expect, beforeEach, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { spawnSync } from 'node:child_process'
import { writeFileSync } from 'node:fs'
import type { Receipt } from '../../../../src/types/receipt'

vi.mock('node:child_process')
vi.mock('node:fs')

const mockFetchWithPayment = vi.hoisted(() =>
  vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve({ price: 2.34, unit: 'USD/lb' }) }))
)

vi.mock('x402-fetch', () => ({
  wrapFetchWithPayment: () => mockFetchWithPayment,
}))

vi.mock('viem', async (importOriginal) => {
  const actual = await importOriginal<typeof import('viem')>()
  return {
    ...actual,
    createWalletClient: () => ({}),
    http: () => ({}),
  }
})

vi.mock('viem/accounts', () => ({
  privateKeyToAccount: () => ({ address: '0x0000000000000000000000000000000000000001' }),
}))

vi.mock('viem/chains', () => ({
  baseSepolia: { id: 84532 },
}))

const { POST } = await import('../../../../src/app/api/workflow/run/route')

// ── helpers ───────────────────────────────────────────────────────────────────

/** Wrap a CRE result object in the prose stdout format the route parses. */
function makeCREStdout(result: object): string {
  return `✓ Workflow Simulation Result:\n${JSON.stringify(JSON.stringify(result))}`
}

// ── fixtures ──────────────────────────────────────────────────────────────────

const creResult = {
  invoiceId: 'INV-001',
  businessName: 'Gallivant Ice Cream',
  compliance: { kyc: 'pass', kyb: 'pass', sanctions: 'clear' },
  dairyPrice: { price: 2.34, unit: 'per lb' },
  underwriting: { score: 82, approved: true, maxAdvanceUsdc: 42500 },
  verdict: 'approved',
  txHash: null,
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
    mockFetchWithPayment.mockResolvedValue({ ok: true, json: () => Promise.resolve({ price: 2.34, unit: 'USD/lb' }) })
    process.env.X402_PRIVATE_KEY = '0x0000000000000000000000000000000000000000000000000000000000000001'
    process.env.DAIRY_API_URL = 'https://g78md4c7ke.execute-api.us-east-1.amazonaws.com/dairy/cream/price'
  })

  it('CRE exits 0 → returns 200 with Receipt shaped from CRE stdout', async () => {
    vi.mocked(spawnSync).mockReturnValue({ status: 0, stdout: makeCREStdout(creResult) } as any)

    const res = await POST(makeRequest())
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.companyName).toBe('Gallivant Ice Cream')
    expect(body.dairyPrice).toBe(2.34)
    expect(body.score).toBe(82)
    expect(body.approved).toBe(true)
  })

  it('compliant is true when kyc=pass, kyb=pass, sanctions=clean', async () => {
    vi.mocked(spawnSync).mockReturnValue({ status: 0, stdout: makeCREStdout(creResult) } as any)

    const res = await POST(makeRequest())
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.compliant).toBe(true)
  })

  it('compliant is false when any compliance field deviates from passing value', async () => {
    const failingResult = {
      ...creResult,
      compliance: { kyc: 'fail', kyb: 'pass', sanctions: 'clean' },
    }
    vi.mocked(spawnSync).mockReturnValue({ status: 0, stdout: makeCREStdout(failingResult) } as any)

    const res = await POST(makeRequest())
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.compliant).toBe(false)
  })

  it('approved reflects underwriting.approved from CRE stdout', async () => {
    const rejectedResult = {
      ...creResult,
      underwriting: { score: 40, approved: false, maxAdvanceUsdc: 0 },
    }
    vi.mocked(spawnSync).mockReturnValue({ status: 0, stdout: makeCREStdout(rejectedResult) } as any)

    const res = await POST(makeRequest())
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.approved).toBe(false)
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

  it('[happy-path] x402 fetch returns price → dairyPriceUsdPerLb present in --http-payload passed to spawnSync', async () => {
    vi.mocked(spawnSync).mockReturnValue({ status: 0, stdout: makeCREStdout(creResult) } as any)

    await POST(makeRequest())

    const args = vi.mocked(spawnSync).mock.calls[0][1] as string[]
    const idx = args.indexOf('--http-payload')
    const payload = JSON.parse(args[idx + 1])
    expect(payload.dairyPriceUsdPerLb).toBe(2.34)
  })

  it('[unhappy-path] x402 fetch throws → returns 500 and spawnSync is not called', async () => {
    mockFetchWithPayment.mockRejectedValueOnce(new Error('network error'))

    const res = await POST(makeRequest())

    expect(res.status).toBe(500)
    expect(vi.mocked(spawnSync)).not.toHaveBeenCalled()
  })
})
