'use client'

import { useState } from 'react'
import { useDynamicContext } from '@dynamic-labs/sdk-react-core'
import { EthereumWalletConnector } from '@dynamic-labs/ethereum'
import { createPublicClient, http } from 'viem'

const USDC_ADDRESS = process.env.NEXT_PUBLIC_USDC_ADDRESS as `0x${string}`
const ESCROW_ADDRESS = process.env.NEXT_PUBLIC_PROOF_GATED_ESCROW_ADDRESS as `0x${string}`
const DEAL_ID = BigInt(process.env.NEXT_PUBLIC_DEAL_ID ?? '2')

const ERC20_APPROVE_ABI = [
  {
    name: 'approve',
    type: 'function',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ type: 'bool' }],
    stateMutability: 'nonpayable',
  },
] as const

const DEPOSIT_ABI = [
  {
    name: 'deposit',
    type: 'function',
    inputs: [
      { name: 'dealId', type: 'uint256' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
] as const

type DepositStatus = 'idle' | 'approving' | 'depositing' | 'done' | 'error'

export function EscrowDeposit() {
  const [amount, setAmount] = useState('')
  const [status, setStatus] = useState<DepositStatus>('idle')
  const [txHash, setTxHash] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const { primaryWallet } = useDynamicContext()

  async function handleDeposit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    try {
      const walletClient = await (primaryWallet?.connector as EthereumWalletConnector).getWalletClient()

      if (!walletClient) throw new Error('Wallet client not available')

      const amountBigInt = BigInt(Math.round(parseFloat(amount) * 1_000_000))

      const publicClient = createPublicClient({
        transport: http(process.env.NEXT_PUBLIC_ARC_RPC_URL ?? 'https://rpc.testnet.arc.network'),
      })

      // Step 1: approve
      setStatus('approving')
      const approveTx = await walletClient.writeContract({
        address: USDC_ADDRESS,
        abi: ERC20_APPROVE_ABI,
        functionName: 'approve',
        args: [ESCROW_ADDRESS, amountBigInt],
      })
      await publicClient.waitForTransactionReceipt({ hash: approveTx })

      // Step 2: deposit
      setStatus('depositing')
      const depositTx = await walletClient.writeContract({
        address: ESCROW_ADDRESS,
        abi: DEPOSIT_ABI,
        functionName: 'deposit',
        args: [DEAL_ID, amountBigInt],
      })
      await publicClient.waitForTransactionReceipt({ hash: depositTx })

      setTxHash(depositTx)
      setStatus('done')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Transaction failed')
      setStatus('error')
    }
  }

  const inputStyle: React.CSSProperties = {
    background: 'var(--surface)',
    border: '1px solid var(--border-soft)',
    color: 'var(--text-1)',
    borderRadius: 6,
    padding: '8px 12px',
    fontSize: 13,
    fontFamily: 'inherit',
    width: '100%',
    boxSizing: 'border-box',
  }

  const labelStyle: React.CSSProperties = {
    fontSize: 11,
    color: 'var(--text-3)',
    marginBottom: 6,
    display: 'block',
  }

  const buttonStyle: React.CSSProperties = {
    background: 'var(--teal)',
    color: '#fff',
    border: 'none',
    borderRadius: 4,
    padding: '8px 16px',
    fontSize: 13,
    fontWeight: 600,
    cursor: status === 'approving' || status === 'depositing' ? 'not-allowed' : 'pointer',
    fontFamily: 'inherit',
    opacity: status === 'approving' || status === 'depositing' ? 0.6 : 1,
  }

  const busy = status === 'approving' || status === 'depositing'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {status !== 'done' && (
        <form onSubmit={handleDeposit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <p style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 16, lineHeight: 1.5 }}>
              Wallet connected. Enter the amount of USDC to deposit into the escrow.
            </p>
            <label htmlFor="invest-amount" style={labelStyle}>AMOUNT (USDC)</label>
            <input
              id="invest-amount"
              type="number"
              min="1"
              step="any"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 50000"
              required
              disabled={busy}
              style={inputStyle}
            />
          </div>

          {status === 'approving' && (
            <p style={{ fontSize: 12, color: 'var(--text-3)' }}>Approving USDC…</p>
          )}
          {status === 'depositing' && (
            <p style={{ fontSize: 12, color: 'var(--text-3)' }}>Depositing to escrow…</p>
          )}

          {error && (
            <p style={{ fontSize: 12, color: 'hsl(0, 72%, 51%)' }}>{error}</p>
          )}

          <div>
            <button type="submit" disabled={busy} style={buttonStyle}>
              {busy ? 'Processing…' : 'Deposit USDC'}
            </button>
          </div>
        </form>
      )}

      {status === 'done' && txHash && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <p style={{ fontSize: 13, color: 'hsl(142, 71%, 52%)' }}>Deposited ✓</p>
          <a
            href={`https://testnet.arcscan.app/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: 11,
              fontFamily: 'monospace',
              color: 'var(--teal)',
              wordBreak: 'break-all',
              textDecoration: 'none',
            }}
          >
            {txHash} ↗
          </a>
        </div>
      )}
    </div>
  )
}
