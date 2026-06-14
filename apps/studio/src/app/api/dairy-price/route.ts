import { NextResponse } from 'next/server'
import { wrapFetchWithPayment } from 'x402-fetch'
import { createWalletClient, http } from 'viem'
import { baseSepolia } from 'viem/chains'
import { privateKeyToAccount } from 'viem/accounts'

export async function GET(): Promise<NextResponse> {
  try {
    const account = privateKeyToAccount(process.env.X402_PRIVATE_KEY as `0x${string}`)
    const walletClient = createWalletClient({ account, chain: baseSepolia, transport: http() })
    const fetchWithPayment = wrapFetchWithPayment(fetch, walletClient as Parameters<typeof wrapFetchWithPayment>[1])

    const res = await fetchWithPayment(process.env.DAIRY_API_URL!)
    const data = await res.json() as { price: number; unit: string }

    return NextResponse.json({ price: data.price, unit: data.unit })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
