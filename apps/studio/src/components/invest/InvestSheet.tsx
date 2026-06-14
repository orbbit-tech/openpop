'use client'

import { useDynamicContext } from '@dynamic-labs/sdk-react-core'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { OtpSignIn } from './OtpSignIn'
import { EscrowDeposit } from './EscrowDeposit'

interface Props {
  open: boolean
  onClose: () => void
}

export function InvestSheet({ open, onClose }: Props) {
  const { user } = useDynamicContext()

  return (
    <Sheet open={open} onOpenChange={(isOpen: boolean) => { if (!isOpen) onClose() }}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="p-0 border-0 w-full overflow-hidden"
        style={{ background: '#121212', borderLeft: '1px solid hsl(215, 14%, 22%)', maxWidth: 760 }}
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
            Invest
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
          {!user ? (
            <OtpSignIn onSuccess={() => {}} />
          ) : (
            <EscrowDeposit />
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
