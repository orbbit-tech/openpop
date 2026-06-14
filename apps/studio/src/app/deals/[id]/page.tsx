'use client'

import { useState, useEffect } from 'react'
import { MOCK_PROOF } from '@/lib/fixtures'
import { fetchArcReceipt } from '@/lib/arc'
import type { Proof } from '@/types/proof'
import { Nav } from '@/components/Nav'
import { WorkflowCanvas } from '@/components/human/WorkflowCanvas'
import { AgentSheet } from '@/components/agent/AgentSheet'
import { InvestSheet } from '@/components/investor/InvestSheet'

const ARC_EXPLORER = 'https://testnet.arcscan.app'

export default function DealDetailPage() {
  const [agentOpen, setAgentOpen] = useState(false)
  const [investOpen, setInvestOpen] = useState(false)
  // Start with fixture as SSR fallback; hydrated from real sources on mount
  const [proof, setProof] = useState<Proof>(MOCK_PROOF)

  useEffect(() => {
    // Step 1: load CRE results from proof.json (score, compliance, dairy price, txHash…)
    fetch('/api/proof')
      .then((r) => (r.ok ? (r.json() as Promise<Proof>) : null))
      .then((cre) => {
        const base = cre ?? MOCK_PROOF
        setProof(base)
        // Step 2: hydrate Zone 2 from Arc RPC using the txHash from CRE output
        return fetchArcReceipt(base.txHash)
      })
      .then((zone2) => {
        if (zone2) setProof((prev) => ({ ...prev, ...zone2 }))
      })
      .catch(() => {
        // proof.json absent (pre-run) — Arc hydration still runs against fixture txHash
        fetchArcReceipt(MOCK_PROOF.txHash).then((zone2) => {
          if (zone2) setProof((prev) => ({ ...prev, ...zone2 }))
        })
      })
  }, [])

  const txShort = proof.txHash.startsWith('0x')
    ? `${proof.txHash.slice(0, 10)}…${proof.txHash.slice(-6)}`
    : proof.txHash

  return (
    <>
      <Nav />
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
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
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
              {(['For Agents', 'Invest New Deal'] as const).map((label) => {
                const isPrimary = label === 'Invest New Deal'
                return (
                  <button
                    key={label}
                    onClick={() => isPrimary ? setInvestOpen(true) : setAgentOpen(true)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 116,
                      height: 30,
                      borderRadius: 4,
                      fontSize: 12,
                      fontWeight: isPrimary ? 600 : 500,
                      cursor: 'pointer',
                      border: isPrimary ? '1px solid var(--teal)' : '1px solid var(--border-soft)',
                      background: isPrimary ? 'var(--teal)' : 'var(--surface)',
                      color: isPrimary ? '#fff' : 'var(--text-2)',
                      fontFamily: 'inherit',
                    }}
                  >
                    {label}
                  </button>
                )
              })}
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
          {/* Complementary metadata — smaller, muted */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 10, lineHeight: 1 }}>
            {[
              { label: 'Block', value: proof.blockNumber.toLocaleString(), mono: true },
              { label: 'Consensus', value: `${proof.consensus.agreed}/${proof.consensus.total} nodes`, mono: false },
              { label: 'Prover', value: proof.prover, mono: false },
            ].map(({ label, value, mono }, i, arr) => (
              <span key={label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ color: 'var(--text-3)' }}>{label}</span>
                <span style={{ fontFamily: mono ? 'monospace' : 'inherit', color: 'var(--text-3)' }}>{value}</span>
                {i < arr.length - 1 && <span style={{ color: 'var(--border-soft)', marginLeft: 8 }}>·</span>}
              </span>
            ))}
          </div>
        </div>

        {/* Canvas fills remaining viewport height */}
        <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
          <WorkflowCanvas proof={proof} />
        </div>
      </div>

      <AgentSheet open={agentOpen} onClose={() => setAgentOpen(false)} proof={proof} />
      <InvestSheet open={investOpen} onClose={() => setInvestOpen(false)} proof={proof} />
    </>
  )
}
