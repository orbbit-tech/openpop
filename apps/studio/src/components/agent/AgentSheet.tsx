'use client'

import {
  Sheet,
  SheetContent,
} from '@/components/ui/sheet'
import type { Receipt } from '@/types/receipt'
import { RawReceipt } from './RawReceipt'
import { McpSnippet } from './McpSnippet'

interface Props {
  open: boolean
  onClose: () => void
  receipt: Receipt
}

export function AgentSheet({ open, onClose, receipt }: Props) {
  return (
    <Sheet open={open} onOpenChange={(isOpen: boolean) => { if (!isOpen) onClose() }}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="p-0 border-0 w-full sm:max-w-[520px] overflow-hidden"
        style={{ background: '#121212', borderLeft: '1px solid hsl(215, 14%, 22%)' }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 20px 12px',
            borderBottom: '1px solid hsl(215, 14%, 22%)',
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase' as const,
              background: 'linear-gradient(to right, hsl(180,85%,47%), hsl(180,85%,39%))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            For Agents
          </span>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'hsl(215, 14%, 47%)',
              fontSize: 13,
              padding: '2px 4px',
              borderRadius: 4,
              fontFamily: 'inherit',
            }}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px 20px 32px',
            display: 'flex',
            flexDirection: 'column' as const,
            gap: 24,
            scrollbarWidth: 'thin' as const,
            scrollbarColor: 'hsl(215, 14%, 22%) transparent',
          }}
        >
          <RawReceipt receipt={receipt} />
          <McpSnippet />
        </div>
      </SheetContent>
    </Sheet>
  )
}
