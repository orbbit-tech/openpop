import { NextResponse } from 'next/server'
import { wrapFetchWithPayment } from 'x402-fetch'
import { DynamicEvmWalletClient } from '@dynamic-labs-wallet/node-evm'
import { baseSepolia } from 'viem/chains'

export async function GET(): Promise<NextResponse> {
  try {
    const evmClient = new DynamicEvmWalletClient({
      environmentId: process.env.NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID!,
    })
    await evmClient.authenticateApiToken(process.env.DYNAMIC_AUTH_TOKEN!)

    const wallets = await evmClient.getEvmWallets()
    const walletMetadata = wallets[0]

    const walletClient = await evmClient.getWalletClient({
      walletMetadata,
      password: process.env.DYNAMIC_WALLET_PASSWORD!,
      chain: baseSepolia,
    })

    const fetchWithPayment = wrapFetchWithPayment(fetch, walletClient as Parameters<typeof wrapFetchWithPayment>[1])
    const res = await fetchWithPayment(process.env.DAIRY_PRICING_API_URL!)
    const data = await res.json() as { price: number; unit: string }

    return NextResponse.json({ price: data.price, unit: data.unit })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
