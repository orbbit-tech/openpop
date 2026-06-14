import { describe, it, expect, beforeEach, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { readFile } from 'fs/promises'
import type { Proof } from '../../../src/types/proof'

vi.mock('fs/promises')

const { POST } = await import('../../../src/app/api/mcp/route')

// ── fixtures ──────────────────────────────────────────────────────────────────

function buildProof(overrides: Partial<Proof> = {}): Proof {
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

function makeRequest(body: object): NextRequest {
  return new NextRequest('http://localhost/api/mcp', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
}

// ── tests ─────────────────────────────────────────────────────────────────────

describe('POST /api/mcp', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('method initialize → returns 200 with protocolVersion, capabilities, and serverInfo.name', async () => {
    const res = await POST(makeRequest({ jsonrpc: '2.0', method: 'initialize', id: 1 }))
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.protocolVersion).toBe('2025-03-26')
    expect(body.capabilities).toBeDefined()
    expect(body.serverInfo.name).toBe('openpop-mcp')
  })

  it('method tools/list → returns 200 with tools array containing one entry named get_proof', async () => {
    const res = await POST(makeRequest({ jsonrpc: '2.0', method: 'tools/list', id: 2 }))
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(Array.isArray(body.tools)).toBe(true)
    expect(body.tools).toHaveLength(1)
    expect(body.tools[0].name).toBe('get_proof')
  })

  it('method tools/call with params.name get_proof → returns 200 with content[0].type text containing receipt JSON', async () => {
    const receipt = buildProof()
    vi.mocked(readFile).mockResolvedValue(JSON.stringify(receipt) as any)

    const res = await POST(makeRequest({ jsonrpc: '2.0', method: 'tools/call', id: 3, params: { name: 'get_proof' } }))
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.content[0].type).toBe('text')
    const parsed = JSON.parse(body.content[0].text)
    expect(parsed.approved).toBe(true)
  })

  it('method tools/call with unknown tool name → returns 400 with JSON-RPC error code -32601', async () => {
    const res = await POST(makeRequest({ jsonrpc: '2.0', method: 'tools/call', id: 4, params: { name: 'unknown_tool' } }))
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body.error.code).toBe(-32601)
  })

  it('unknown method → returns 400', async () => {
    const res = await POST(makeRequest({ jsonrpc: '2.0', method: 'foobar', id: 5 }))

    expect(res.status).toBe(400)
  })
})
