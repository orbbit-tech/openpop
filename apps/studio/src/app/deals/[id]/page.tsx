'use client'

import { useState } from 'react'
import { MOCK_PROOF } from '@/lib/fixtures'
import { Nav } from '@/components/Nav'
import { WorkflowCanvas } from '@/components/human/WorkflowCanvas'
import { AgentSheet } from '@/components/agent/AgentSheet'
import { InvestSheet } from '@/components/investor/InvestSheet'

const ARC_EXPLORER = 'https://testnet.arcscan.app'

export default function DealDetailPage() {
  const [agentOpen, setAgentOpen] = useState(false)
  const [investOpen, setInvestOpen] = useState(false)
  const proof = MOCK_PROOF

  const txShort = proof.txHash.startsWith('0x')
    ? `${proof.txHash.slice(0, 10)}…${proof.txHash.slice(-6)}`
    : proof.txHash

  return (
    <>
      <Nav />
      <div
        style={{
          maxWidth: 900,
          margin: '0 auto',
          padding: '32px 24px 64px',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
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
              <button
                onClick={() => setAgentOpen(true)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  height: 30,
                  padding: '0 12px',
                  borderRadius: 4,
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: 'pointer',
                  border: '1px solid var(--border-soft)',
                  background: 'var(--surface)',
                  color: 'var(--text-2)',
                  fontFamily: 'inherit',
                }}
              >
                For Agents
              </button>
              <button
                onClick={() => setInvestOpen(true)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  height: 30,
                  padding: '0 12px',
                  borderRadius: 4,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: '1px solid var(--teal)',
                  background: 'var(--teal)',
                  color: '#fff',
                  fontFamily: 'inherit',
                }}
              >
                Invest
              </button>
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: 'var(--border-soft)' }} />

          {/* Row 2: attestation — Tx most prominent */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' as const }}>
            {/* Tx — most important, shown first and larger */}
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: 'var(--text-3)' }}>
                Tx
              </span>
              {proof.txHash.startsWith('0x') ? (
                <a
                  href={`${ARC_EXPLORER}/tx/${proof.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 600, color: 'var(--teal)', textDecoration: 'none' }}
                >
                  {txShort} ↗
                </a>
              ) : (
                <span style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--text-2)' }}>{txShort}</span>
              )}
            </span>

            <span style={{ color: 'var(--border-soft)', fontSize: 11 }}>·</span>

            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: 'var(--text-3)' }}>Block</span>
              <span style={{ fontSize: 11, color: 'var(--text-2)' }}>Arc {proof.blockNumber.toLocaleString()}</span>
            </span>

            <span style={{ color: 'var(--border-soft)', fontSize: 11 }}>·</span>

            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: 'var(--text-3)' }}>Consensus</span>
              <span style={{ fontSize: 11, color: 'var(--text-2)' }}>{proof.consensus.agreed} / {proof.consensus.total} nodes</span>
            </span>

            <span style={{ color: 'var(--border-soft)', fontSize: 11 }}>·</span>

            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: 'var(--text-3)' }}>Prover</span>
              <span style={{ fontSize: 11, color: 'var(--text-2)' }}>{proof.prover}</span>
            </span>
          </div>
        </div>

        <WorkflowCanvas proof={proof} />
      </div>

      <AgentSheet open={agentOpen} onClose={() => setAgentOpen(false)} proof={proof} />
      <InvestSheet open={investOpen} onClose={() => setInvestOpen(false)} proof={proof} />
    </>
  )
}
