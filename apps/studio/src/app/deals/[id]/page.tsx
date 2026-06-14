'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { createPublicClient, http } from 'viem'
import { MOCK_PROOF } from '@/lib/fixtures'
import { fetchArcReceipt } from '@/lib/arc'
import type { Proof } from '@/types/proof'
import { Nav } from '@/components/Nav'
import { WorkflowCanvas } from '@/components/human/WorkflowCanvas'
import { AgentSheet } from '@/components/agent/AgentSheet'
import { InvestSheet } from '@/components/invest/InvestSheet'

const ARC_EXPLORER = 'https://testnet.arcscan.app'
const ESCROW_ADDRESS = process.env.NEXT_PUBLIC_PROOF_GATED_ESCROW_ADDRESS as `0x${string}`

const DEALS_ABI = [
  {
    name: 'deals',
    type: 'function',
    inputs: [{ name: '', type: 'uint256' }],
    outputs: [
      { name: 'recipient', type: 'address' },
      { name: 'amount', type: 'uint256' },
      { name: 'state', type: 'uint8' },
    ],
    stateMutability: 'view',
  },
] as const

type OnChainState = 'awaiting' | 'funded' | 'released' | 'rejected' | null

const STATE_MAP: Record<number, OnChainState> = { 0: 'awaiting', 1: 'funded', 2: 'released', 3: 'rejected' }

export default function DealDetailPage() {
  const params = useParams<{ id: string }>()
  const invoiceId = params?.id ?? 'gallivant-001'
  const [agentOpen, setAgentOpen] = useState(false)
  const [investOpen, setInvestOpen] = useState(false)
  const [proof, setProof] = useState<Proof>(MOCK_PROOF)
  const [onChainState, setOnChainState] = useState<OnChainState>(null)
  const [pollHandle, setPollHandle] = useState<ReturnType<typeof setInterval> | null>(null)
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    return () => { if (pollHandle) clearInterval(pollHandle) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pollHandle])

  useEffect(() => {
    fetch(`/api/proof/${invoiceId}`)
      .then((r) => (r.ok ? (r.json() as Promise<Proof>) : null))
      .then((cre) => {
        const base = cre ?? MOCK_PROOF
        setProof(base)

        // Seeded proofs have no prefetchSteps — trigger a real CRE run to replace them.
        if (!base.prefetchSteps) {
          setGenerating(true)
          fetch('/api/workflow/run', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ invoiceId }),
          })
            .then((r) => r.ok ? r.json() as Promise<Proof> : null)
            .then((real) => { if (real) setProof(real) })
            .catch(() => {})
            .finally(() => setGenerating(false))
        }

        // Read on-chain deal state if we have a dealId from the proof
        if (base.onChainDealId != null) {
          const publicClient = createPublicClient({
            transport: http(process.env.NEXT_PUBLIC_ARC_RPC_URL ?? 'https://rpc.testnet.arc.network'),
          })
          publicClient.readContract({
            address: ESCROW_ADDRESS,
            abi: DEALS_ABI,
            functionName: 'deals',
            args: [BigInt(base.onChainDealId)],
          }).then((result) => {
            const [, , state] = result as [string, bigint, number]
            setOnChainState(STATE_MAP[state] ?? null)
          }).catch(() => { /* non-fatal */ })
        }

        return fetchArcReceipt(base.txHash)
      })
      .then((zone2) => {
        if (zone2) setProof((prev) => ({ ...prev, ...zone2 }))
      })
      .catch(() => {
        fetchArcReceipt(MOCK_PROOF.txHash).then((zone2) => {
          if (zone2) setProof((prev) => ({ ...prev, ...zone2 }))
        })
      })
  }, [invoiceId])

  const txShort = proof.txHash.startsWith('0x')
    ? `${proof.txHash.slice(0, 10)}…${proof.txHash.slice(-6)}`
    : proof.txHash

  return (
    <>
      <Nav onSignIn={() => setInvestOpen(true)} />
      <div
        style={{
          maxWidth: 1100,
          margin: '0 auto',
          padding: '12px 24px 12px',
          height: 'calc(100vh - 52px)',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          overflow: 'hidden',
        }}
      >
        {/* Deal header */}
        <div
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border-soft)',
            borderRadius: 'var(--radius-lg)',
            padding: '16px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
          }}
        >
          {/* Row 1: identity + actions */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
              <div
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  background: proof.approved ? 'var(--teal)' : 'hsl(0, 72%, 51%)',
                  flexShrink: 0,
                }}
              />
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-1)', letterSpacing: '-0.02em' }}>
                {proof.companyName} — Invoice {proof.approved ? 'Approved' : 'Rejected'}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
              {[
                { label: 'For Agents', isPrimary: false },
                {
                  label: onChainState === 'funded' ? 'Awaiting Proof'
                    : onChainState === 'released' ? 'Settled — Approved'
                    : onChainState === 'rejected' ? 'Settled — Rejected'
                    : 'Invest New Deal',
                  isPrimary: true,
                  disabled: onChainState === 'funded' || onChainState === 'released' || onChainState === 'rejected',
                },
              ].map(({ label, isPrimary, disabled }) => (
                  <button
                    key={label}
                    onClick={() => isPrimary ? setInvestOpen(true) : setAgentOpen(true)}
                    disabled={disabled}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 136,
                      height: 30,
                      borderRadius: 4,
                      fontSize: 12,
                      fontWeight: isPrimary ? 600 : 500,
                      cursor: disabled ? 'default' : 'pointer',
                      border: isPrimary ? '1px solid var(--teal)' : '1px solid var(--border-soft)',
                      background: isPrimary ? 'var(--teal)' : 'var(--surface)',
                      color: isPrimary ? '#fff' : 'var(--text-2)',
                      fontFamily: 'inherit',
                      opacity: disabled ? 0.6 : 1,
                    }}
                  >
                    {label}
                  </button>
                ))}
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: 'var(--border-soft)' }} />

          {/* Tx hash — primary row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, lineHeight: 1 }}>
            <span style={{ color: 'var(--text-3)' }}>Tx</span>
            {proof.txHash.startsWith('0x') ? (
              <a
                href={`${ARC_EXPLORER}/tx/${proof.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontFamily: 'monospace', color: 'var(--teal)', textDecoration: 'none' }}
              >
                {txShort} ↗
              </a>
            ) : (
              <span style={{ fontFamily: 'monospace', color: 'var(--text-2)' }}>{txShort}</span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 10, lineHeight: 1 }}>
            {[
              { label: 'Block', value: proof.blockNumber.toLocaleString(), mono: true },
              { label: 'Consensus', value: `${proof.consensus.agreed}/${proof.consensus.total} nodes`, mono: false },
            ].map(({ label, value, mono }, i, arr) => (
              <span key={label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ color: 'var(--text-3)' }}>{label}</span>
                <span style={{ fontFamily: mono ? 'monospace' : 'inherit', color: 'var(--text-3)' }}>{value}</span>
                {i < arr.length - 1 && <span style={{ color: 'var(--border-soft)', marginLeft: 8 }}>·</span>}
              </span>
            ))}
          </div>
        </div>

        {/* Generating banner — shown while CRE is producing a real proof */}
        {generating && (
          <div style={{
            background: 'hsla(180,85%,32%,0.06)',
            border: '1px solid hsla(180,85%,32%,0.18)',
            borderRadius: 8,
            padding: '10px 14px',
            fontSize: 12,
            color: 'hsl(180,85%,28%)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ animation: 'spin 0.8s linear infinite', flexShrink: 0 }}>
              <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
              <circle cx="8" cy="8" r="6" stroke="hsla(180,85%,32%,0.25)" strokeWidth="2" />
              <path d="M8 2a6 6 0 0 1 6 6" stroke="hsl(180,85%,32%)" strokeWidth="2" strokeLinecap="round" />
            </svg>
            Generating CRE proof — running compliance, dairy price fetch, and underwriting (~2 min)…
          </div>
        )}

        {/* Canvas fills remaining viewport height */}
        <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
          <WorkflowCanvas proof={proof} />
        </div>
      </div>

      <AgentSheet open={agentOpen} onClose={() => setAgentOpen(false)} proof={proof} />
      <InvestSheet
        open={investOpen}
        onClose={() => setInvestOpen(false)}
        invoiceId={invoiceId}
        onDeposited={(dealId) => {
          // Immediately reflect funded state — don't wait for the proof poll
          setOnChainState('funded')
          setProof((prev) => ({ ...prev, onChainDealId: Number(dealId) }))

          // Poll proof.json every 15s for up to 3 min until finalize writes a real txHash
          if (pollHandle) clearInterval(pollHandle)
          let attempts = 0
          const handle = setInterval(() => {
            attempts++
            fetch(`/api/proof/${invoiceId}`)
              .then((r) => r.ok ? r.json() as Promise<Proof> : null)
              .then((updated) => {
                if (updated?.txHash?.startsWith('0x')) {
                  setProof(updated)
                  setOnChainState('released')
                  clearInterval(handle)
                }
              })
              .catch(() => {})
            if (attempts >= 12) clearInterval(handle) // stop after 3 min
          }, 15_000)
          setPollHandle(handle)
        }}
      />
    </>
  )
}
