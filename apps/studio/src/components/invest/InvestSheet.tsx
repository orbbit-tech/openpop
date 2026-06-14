'use client'

import { useDynamicContext } from '@dynamic-labs/sdk-react-core'
import { Dialog, DialogContent } from '@/components/ui/dialog'

import { OtpSignIn } from './OtpSignIn'
import { EscrowDeposit } from './EscrowDeposit'

interface Props {
  open: boolean
  onClose: () => void
  invoiceId?: string
  onDeposited?: (dealId: bigint) => void
}

const cardStyle: React.CSSProperties = {
  background: '#fff',
  border: '1px solid rgba(0,0,0,0.08)',
  borderRadius: 12,
  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.07), 0 10px 40px -4px rgba(0,0,0,0.12)',
  position: 'relative',
}

const closeBtnStyle: React.CSSProperties = {
  position: 'absolute',
  top: 12,
  right: 12,
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  color: '#94a3b8',
  fontSize: 16,
  lineHeight: 1,
  padding: '4px 6px',
  borderRadius: 6,
  fontFamily: 'inherit',
}

export function InvestSheet({ open, onClose, invoiceId = 'gallivant-001', onDeposited }: Props) {
  const { user } = useDynamicContext()

  return (
    <Dialog open={open} onOpenChange={(isOpen: boolean) => { if (!isOpen) onClose() }}>
      <DialogContent>
        <div style={cardStyle}>
          <button onClick={onClose} aria-label="Close" style={closeBtnStyle}>✕</button>
          <div style={{ padding: 28 }}>
            {!user
              ? <OtpSignIn onSuccess={() => {}} />
              : <EscrowDeposit invoiceId={invoiceId} onDeposited={onDeposited} />
            }
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
