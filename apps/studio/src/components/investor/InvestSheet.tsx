'use client'

import { Sheet, SheetContent } from '@/components/ui/sheet'
import type { Proof } from '@/types/proof'

interface Props {
  open: boolean
  onClose: () => void
  proof: Proof
}

export function InvestSheet({ open, onClose, proof }: Props) {
  return (
    <Sheet open={open} onOpenChange={(isOpen: boolean) => { if (!isOpen) onClose() }}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="p-0 border-0 w-full overflow-hidden"
        style={{ maxWidth: 400 }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 20px 12px',
            borderBottom: '1px solid var(--border-soft)',
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--teal)',
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
              color: 'var(--text-3)',
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
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          {/* Deposit card */}
          <div
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border-soft)',
              borderRadius: 'var(--radius-lg)',
              padding: '16px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)' }}>
                  {proof.companyName}
                </span>
                <span style={{ fontSize: 11, color: 'var(--text-3)' }}>
                  {proof.invoiceAmount}
                </span>
              </div>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-end',
                  gap: 2,
                }}
              >
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)' }}>
                  $50,000
                </span>
                <span style={{ fontSize: 11, color: 'var(--text-3)' }}>USDC</span>
              </div>
            </div>

            <div
              style={{
                height: 1,
                background: 'var(--border-soft)',
              }}
            />

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                { label: 'Credit Score', value: `${proof.score}/100` },
                { label: 'Confidence', value: `${proof.confidence}%` },
                { label: 'Prover', value: proof.prover },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{label}</span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-2)' }}>
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Status badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              height: 32,
              padding: '0 14px',
              borderRadius: 100,
              fontSize: 12,
              fontWeight: 600,
              background: 'var(--teal)',
              color: '#fff',
              alignSelf: 'flex-start',
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.7)',
                flexShrink: 0,
              }}
            />
            Escrow Ready
          </div>

          <p
            style={{
              fontSize: 11,
              color: 'var(--text-3)',
              margin: 0,
              lineHeight: 1.5,
            }}
          >
            Dynamic Flow deposit widget coming in M1/02. USDC will be held in the
            Arc ProofGatedEscrow contract until the proof is verified on-chain.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  )
}
