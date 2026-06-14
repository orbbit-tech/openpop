'use client'

import { useState } from 'react'
import { useDynamicContext } from '@dynamic-labs/sdk-react-core'
import { isEthereumWallet } from '@dynamic-labs/ethereum'
import { createPublicClient, http } from 'viem'

const USDC_ADDRESS = process.env.NEXT_PUBLIC_USDC_ADDRESS as `0x${string}`
const ESCROW_ADDRESS = process.env.NEXT_PUBLIC_PROOF_GATED_ESCROW_ADDRESS as `0x${string}`
const BUSINESS_WALLET = process.env.NEXT_PUBLIC_BUSINESS_WALLET_ADDRESS as `0x${string}`

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

const CREATE_DEAL_ABI = [
  {
    name: 'createDeal',
    type: 'function',
    inputs: [{ name: 'recipient', type: 'address' }],
    outputs: [{ name: 'dealId', type: 'uint256' }],
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

type DepositStatus = 'idle' | 'creating' | 'approving' | 'depositing' | 'done' | 'error'

interface Props {
  invoiceId: string
  onDeposited?: (dealId: bigint) => void
}

function truncateTx(hash: string) {
  return `${hash.slice(0, 6)}...${hash.slice(-4)}`
}

function Spinner() {
  return (
    <svg
      width="16" height="16" viewBox="0 0 16 16" fill="none"
      style={{ animation: 'spin 0.8s linear infinite', flexShrink: 0 }}
    >
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      <circle cx="8" cy="8" r="6" stroke="#e2e8f0" strokeWidth="2" />
      <path d="M8 2a6 6 0 0 1 6 6" stroke="hsl(180,85%,42%)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function CheckIcon({ size = 16, color = 'hsl(142,71%,45%)' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
      <circle cx="8" cy="8" r="7" stroke={color} strokeWidth="1.5" />
      <path d="M5 8l2 2 4-4" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function DotIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
      <circle cx="8" cy="8" r="7" stroke="#e2e8f0" strokeWidth="1.5" />
      <circle cx="8" cy="8" r="2.5" fill="#cbd5e1" />
    </svg>
  )
}

export function EscrowDeposit({ invoiceId, onDeposited }: Props) {
  const [amount, setAmount] = useState('')
  const [status, setStatus] = useState<DepositStatus>('idle')
  const [txHash, setTxHash] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const { primaryWallet } = useDynamicContext()

  async function handleDeposit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    try {
      if (!primaryWallet || !isEthereumWallet(primaryWallet)) throw new Error('Ethereum wallet not connected')
      const walletClient = await primaryWallet.getWalletClient()
      if (!walletClient) throw new Error('Wallet client not available')

      const amountBigInt = BigInt(Math.round(parseFloat(amount) * 1_000_000))

      const publicClient = createPublicClient({
        transport: http(process.env.NEXT_PUBLIC_ARC_RPC_URL ?? 'https://rpc.testnet.arc.network'),
      })

      // Step 1 — create a fresh deal; recipient = business wallet (not investor)
      setStatus('creating')
      const createTx = await walletClient.writeContract({
        address: ESCROW_ADDRESS,
        abi: CREATE_DEAL_ABI,
        functionName: 'createDeal',
        args: [BUSINESS_WALLET ?? primaryWallet.address as `0x${string}`],
      })
      const createReceipt = await publicClient.waitForTransactionReceipt({ hash: createTx })
      // DealCreated(uint256 indexed dealId, address indexed recipient) — dealId is topics[1]
      const log = createReceipt.logs.find(l => l.address.toLowerCase() === ESCROW_ADDRESS.toLowerCase())
      if (!log?.topics[1]) throw new Error('DealCreated log not found')
      const freshDealId = BigInt(log.topics[1])

      // Step 2 — approve USDC spend
      setStatus('approving')
      const approveTx = await walletClient.writeContract({
        address: USDC_ADDRESS,
        abi: ERC20_APPROVE_ABI,
        functionName: 'approve',
        args: [ESCROW_ADDRESS, amountBigInt],
      })
      await publicClient.waitForTransactionReceipt({ hash: approveTx })

      // Step 3 — deposit into escrow for this deal
      setStatus('depositing')
      const depositTx = await walletClient.writeContract({
        address: ESCROW_ADDRESS,
        abi: DEPOSIT_ABI,
        functionName: 'deposit',
        args: [freshDealId, amountBigInt],
      })
      await publicClient.waitForTransactionReceipt({ hash: depositTx })

      setTxHash(depositTx)
      setStatus('done')
      onDeposited?.(freshDealId)

      // Fire-and-forget: CRE writeReport for this specific dealId (~2 min)
      fetch('/api/workflow/finalize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dealId: freshDealId.toString(), invoiceId }),
      }).catch(() => { /* background — non-fatal */ })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Transaction failed')
      setStatus('error')
    }
  }

  const busy = status === 'creating' || status === 'approving' || status === 'depositing'
  const c = {
    muted: '#64748b',
    border: '#e2e8f0',
    surface: '#f8fafc',
    text: '#0f172a',
    teal: 'hsl(180,85%,32%)',
  }

  // ── Success ────────────────────────────────────────────────────────────────
  if (status === 'done' && txHash) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '24px 0' }}>
        <div style={{
          width: 52, height: 52, borderRadius: '50%',
          background: '#f0fdf4', border: '1px solid #bbf7d0',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <CheckIcon size={24} color="hsl(142,71%,52%)" />
        </div>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 18, fontWeight: 600, color: c.text, margin: '0 0 4px', letterSpacing: '-0.02em' }}>
            Deposit confirmed
          </p>
          <p style={{ fontSize: 13, color: c.muted, margin: '0 0 2px' }}>
            {parseFloat(amount).toLocaleString()} USDC deposited to escrow
          </p>
          <p style={{ fontSize: 11, color: c.muted, margin: 0 }}>
            Verification running in background — refresh the deal page in ~2 min to see proof.
          </p>
        </div>
        <a
          href={`https://testnet.arcscan.app/tx/${txHash}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: c.surface, border: `1px solid ${c.border}`,
            borderRadius: 6, padding: '6px 10px',
            fontFamily: 'monospace', fontSize: 12, color: c.teal,
            textDecoration: 'none',
          }}
        >
          {truncateTx(txHash)}
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
            <path d="M2 9L9 2M9 2H4M9 2v5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
        </a>
      </div>
    )
  }

  // ── Processing ─────────────────────────────────────────────────────────────
  if (busy) {
    const createActive = status === 'creating'
    const approveActive = status === 'approving'
    const depositActive = status === 'depositing'
    const pastCreate = approveActive || depositActive
    const pastApprove = depositActive

    type StepProps = { icon: React.ReactNode; label: string; sub: string; active: boolean; done: boolean }
    function Step({ icon, label, sub, active, done }: StepProps) {
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px' }}>
          {icon}
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 13, fontWeight: 500, color: done ? 'hsl(142,71%,45%)' : active ? c.text : c.muted, margin: 0 }}>
              {label}
            </p>
            <p style={{ fontSize: 11, color: c.muted, margin: '2px 0 0' }}>{sub}</p>
          </div>
          {done && <CheckIcon />}
        </div>
      )
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 11, color: c.muted, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 4px' }}>
            {createActive ? 'Registering deal' : 'Depositing'}
          </p>
          <p style={{ fontSize: 26, fontWeight: 600, color: c.text, margin: 0, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>
            {parseFloat(amount).toLocaleString()} <span style={{ fontSize: 14, fontWeight: 400, color: c.muted }}>USDC</span>
          </p>
        </div>

        <div style={{ background: c.surface, border: `1px solid ${c.border}`, borderRadius: 10, padding: '4px 0' }}>
          <Step
            icon={pastCreate ? <CheckIcon /> : createActive ? <Spinner /> : <DotIcon />}
            label={pastCreate ? 'Deal registered on-chain' : 'Registering deal'}
            sub="Creating a fresh escrow slot — recipient set to business wallet"
            active={createActive}
            done={pastCreate}
          />
          <div style={{ height: 1, background: c.border, margin: '0 16px' }} />
          <Step
            icon={pastApprove ? <CheckIcon /> : approveActive ? <Spinner /> : <DotIcon />}
            label={pastApprove ? 'USDC spend approved' : 'Approving USDC spend'}
            sub="Authorising the escrow contract"
            active={approveActive}
            done={pastApprove}
          />
          <div style={{ height: 1, background: c.border, margin: '0 16px' }} />
          <Step
            icon={depositActive ? <Spinner /> : <DotIcon />}
            label="Depositing to escrow"
            sub="Locking funds on-chain"
            active={depositActive}
            done={false}
          />
        </div>

        <p style={{ fontSize: 11, color: c.muted, textAlign: 'center', margin: 0 }}>
          Keep this window open while the transaction confirms.
        </p>
      </div>
    )
  }

  // ── Input form ─────────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <p style={{ fontSize: 16, fontWeight: 600, color: c.text, margin: '0 0 4px', letterSpacing: '-0.01em' }}>
          Deposit USDC
        </p>
        <p style={{ fontSize: 13, color: c.muted, margin: 0 }}>
          Funds are held in escrow until deal conditions are met.
        </p>
      </div>

      <form onSubmit={handleDeposit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div>
          <label style={{ fontSize: 11, color: c.muted, display: 'block', marginBottom: 6, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Amount
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type="number"
              min="1"
              step="any"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              required
              disabled={busy}
              style={{
                background: c.surface,
                border: `1px solid ${c.border}`,
                color: c.text,
                borderRadius: 8,
                padding: '11px 56px 11px 14px',
                fontSize: 16,
                fontWeight: 500,
                fontFamily: 'inherit',
                width: '100%',
                boxSizing: 'border-box',
                outline: 'none',
                transition: 'border-color 0.15s',
                fontVariantNumeric: 'tabular-nums',
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = c.teal }}
              onBlur={(e) => { e.currentTarget.style.borderColor = c.border }}
            />
            <span style={{
              position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
              fontSize: 12, fontWeight: 600, color: c.muted, letterSpacing: '0.04em',
            }}>
              USDC
            </span>
          </div>
        </div>

        {(status === 'error' || error) && (
          <div style={{
            background: '#fef2f2', border: '1px solid #fecaca',
            borderRadius: 8, padding: '10px 12px',
          }}>
            <p style={{ fontSize: 12, color: '#ef4444', margin: 0 }}>{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={busy || !amount}
          style={{
            background: busy || !amount ? 'hsl(180,85%,20%)' : c.teal,
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            height: 42,
            fontSize: 14,
            fontWeight: 600,
            cursor: busy || !amount ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit',
            opacity: busy || !amount ? 0.55 : 1,
            width: '100%',
            transition: 'opacity 0.15s, background 0.15s',
          }}
        >
          Deposit USDC
        </button>
      </form>

      <div>
        <label style={{ fontSize: 11, color: c.muted, display: 'block', marginBottom: 6, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          Network
        </label>
        <select
          disabled
          style={{
            background: c.surface,
            border: `1px solid ${c.border}`,
            color: c.muted,
            borderRadius: 8,
            padding: '11px 14px',
            fontSize: 14,
            fontWeight: 400,
            fontFamily: 'inherit',
            width: '100%',
            outline: 'none',
            appearance: 'none',
            cursor: 'default',
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath d='M2 4l4 4 4-4' stroke='%2394a3b8' stroke-width='1.5' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 12px center',
            paddingRight: 36,
          }}
        >
          <option value="arc-testnet">ARC Testnet</option>
        </select>
      </div>
    </div>
  )
}
