import { describe, it, expect, beforeEach, vi } from 'vitest'

const mockFetchWithPayment = vi.hoisted(() =>
  vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve({ price: 2.13, unit: 'USD/lb' }) }))
)

const mockGetEvmWallets = vi.hoisted(() => vi.fn().mockResolvedValue([{
  walletId: 'test-wallet-id',
  accountAddress: '0x2F2Af5d1c240eF9AaDbef4DFa74c50B6485ec452',
  chainName: 'EVM',
  thresholdSignatureScheme: 'TWO_OF_TWO',
}]))

const mockGetWalletClient = vi.hoisted(() => vi.fn().mockResolvedValue({}))
const mockAuthenticateApiToken = vi.hoisted(() => vi.fn().mockResolvedValue(undefined))

vi.mock('x402-fetch', () => ({
  wrapFetchWithPayment: () => mockFetchWithPayment,
}))

vi.mock('@dynamic-labs-wallet/node-evm', () => ({
  DynamicEvmWalletClient: vi.fn().mockImplementation(() => ({
    authenticateApiToken: mockAuthenticateApiToken,
    getEvmWallets: mockGetEvmWallets,
    getWalletClient: mockGetWalletClient,
  })),
}))

vi.mock('viem/chains', () => ({
  baseSepolia: { id: 84532 },
}))

const { GET } = await import('../../../src/app/api/dairy-price/route')

describe('GET /api/dairy-price', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetEvmWallets.mockResolvedValue([{
      walletId: 'test-wallet-id',
      accountAddress: '0x2F2Af5d1c240eF9AaDbef4DFa74c50B6485ec452',
      chainName: 'EVM',
      thresholdSignatureScheme: 'TWO_OF_TWO',
    }])
    mockGetWalletClient.mockResolvedValue({})
    mockAuthenticateApiToken.mockResolvedValue(undefined)
    process.env.NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID = 'test-env-id'
    process.env.DYNAMIC_AUTH_TOKEN = 'test-auth-token'
    process.env.DYNAMIC_WALLET_PASSWORD = 'test-password'
    process.env.DAIRY_PRICING_API_URL = 'https://g78md4c7ke.execute-api.us-east-1.amazonaws.com/dairy/cream/price'
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
