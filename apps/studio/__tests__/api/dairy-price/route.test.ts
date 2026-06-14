import { describe, it, expect, beforeEach, vi } from 'vitest'

const mockFetchWithPayment = vi.hoisted(() =>
  vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve({ price: 2.13, unit: 'USD/lb' }) }))
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

const { GET } = await import('../../../src/app/api/dairy-price/route')

describe('GET /api/dairy-price', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    process.env.X402_PRIVATE_KEY = '0x0000000000000000000000000000000000000000000000000000000000000001'
    process.env.DAIRY_API_URL = 'https://g78md4c7ke.execute-api.us-east-1.amazonaws.com/dairy/cream/price'
  })

  it('[happy-path] x402 fetch succeeds → returns 200 with { price: 2.13, unit: "USD/lb" }', async () => {
    mockFetchWithPayment.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ price: 2.13, unit: 'USD/lb' }),
    })

    const res = await GET()
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.price).toBe(2.13)
    expect(body.unit).toBe('USD/lb')
  })

  it('[unhappy-path] x402 fetch throws → returns 500', async () => {
    mockFetchWithPayment.mockRejectedValueOnce(new Error('network'))

    const res = await GET()

    expect(res.status).toBe(500)
  })
})
