'use client'

import { useState } from 'react'
import { MOCK_RECEIPT } from '@/lib/fixtures'
import { Nav } from '@/components/Nav'
import { VerdictCard } from '@/components/human/VerdictCard'
import { WorkflowCanvas } from '@/components/human/WorkflowCanvas'
import { AttestationBar } from '@/components/human/AttestationBar'
import { AgentSheet } from '@/components/agent/AgentSheet'

export default function Home() {
  const [sheetOpen, setSheetOpen] = useState<boolean>(false)

  return (
    <>
      <Nav onOpen={() => setSheetOpen(true)} />
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
        <VerdictCard receipt={MOCK_RECEIPT} />
        <WorkflowCanvas receipt={MOCK_RECEIPT} />
        <AttestationBar receipt={MOCK_RECEIPT} />
      </div>
      <AgentSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        receipt={MOCK_RECEIPT}
      />
    </>
  )
}
