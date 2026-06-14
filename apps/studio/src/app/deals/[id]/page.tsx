'use client'

import { useState } from 'react'
import { MOCK_PROOF } from '@/lib/fixtures'
import { Nav } from '@/components/Nav'
import { VerdictCard } from '@/components/human/VerdictCard'
import { WorkflowCanvas } from '@/components/human/WorkflowCanvas'
import { AttestationBar } from '@/components/human/AttestationBar'
import { AgentSheet } from '@/components/agent/AgentSheet'
import { InvestSheet } from '@/components/investor/InvestSheet'

export default function DealDetailPage() {
  const [agentOpen, setAgentOpen] = useState(false)
  const [investOpen, setInvestOpen] = useState(false)
  const proof = MOCK_PROOF

  return (
    <>
      <Nav />
      <div
        style={{
          maxWidth: 820,
          margin: '0 auto',
          padding: '32px 24px 64px',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}
      >
        {/* Action row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
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

        <VerdictCard proof={proof} />
        <WorkflowCanvas proof={proof} />
        <AttestationBar proof={proof} />
      </div>

      <AgentSheet open={agentOpen} onClose={() => setAgentOpen(false)} proof={proof} />
      <InvestSheet open={investOpen} onClose={() => setInvestOpen(false)} proof={proof} />
    </>
  )
}
