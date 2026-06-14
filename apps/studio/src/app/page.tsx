'use client'

import { useState } from 'react'
import type { Proof } from '@/types/proof'
import { MOCK_PROOF } from '@/lib/fixtures'
import { Nav } from '@/components/Nav'
import { VerdictCard } from '@/components/human/VerdictCard'
import { WorkflowCanvas } from '@/components/human/WorkflowCanvas'
import { AttestationBar } from '@/components/human/AttestationBar'
import { AgentSheet } from '@/components/agent/AgentSheet'

type WorkflowStatus = 'idle' | 'running' | 'done' | 'error'

function statusLabel(status: WorkflowStatus): string {
  if (status === 'idle') return 'Showing fixture data'
  if (status === 'running') return 'Workflow running…'
  if (status === 'done') return 'Live · workflow completed'
  return 'Workflow failed — showing fixture'
}

function statusColor(status: WorkflowStatus): string {
  if (status === 'idle') return 'hsl(215, 14%, 47%)'
  if (status === 'running') return 'hsl(38, 92%, 55%)'
  if (status === 'done') return 'hsl(142, 71%, 52%)'
  return 'hsl(0, 72%, 51%)'
}

export default function Home() {
  const [sheetOpen, setSheetOpen] = useState<boolean>(false)
  const [status, setStatus] = useState<WorkflowStatus>('idle')
  const [liveProof, setLiveProof] = useState<Proof | null>(null)

  const proof = liveProof ?? MOCK_PROOF

  async function runWorkflow() {
    setStatus('running')
    try {
      const res = await fetch('/api/workflow/run', { method: 'POST' })
      if (!res.ok) throw new Error(String(res.status))
      const data: Proof = await res.json()
      setLiveProof(data)
      setStatus('done')
    } catch {
      setStatus('error')
    }
  }

  return (
    <>
      <Nav onOpen={() => setSheetOpen(true)} txHash={proof.txHash} />
      <div
        style={{
          maxWidth: 820,
          margin: '0 auto',
          padding: '32px 24px 64px',
          display: 'flex',
          flexDirection: 'column' as const,
          gap: 10,
        }}
      >
        {/* Run Workflow row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginBottom: 2,
          }}
        >
          <button
            onClick={runWorkflow}
            disabled={status === 'running'}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              height: 30,
              padding: '0 12px',
              borderRadius: 4,
              fontSize: 12,
              fontWeight: 600,
              fontFamily: 'inherit',
              cursor: status === 'running' ? 'not-allowed' : 'pointer',
              border: status === 'running' ? '1px solid var(--border-soft)' : '1px solid var(--teal)',
              background: status === 'running' ? 'var(--surface)' : 'var(--teal)',
              color: status === 'running' ? 'var(--text-3)' : '#fff',
            }}
          >
            Run Workflow
          </button>
          <span
            style={{
              fontSize: 11,
              color: statusColor(status),
            }}
          >
            {statusLabel(status)}
          </span>
        </div>

        <VerdictCard proof={proof} />
        <WorkflowCanvas proof={proof} />
        <AttestationBar proof={proof} />
      </div>
      <AgentSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        proof={proof}
      />
    </>
  )
}
