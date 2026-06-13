import type { Proof } from '@/types/proof'

interface Props {
  proof: Proof
}

export function VerdictCard({ proof }: Props) {
  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border-soft)',
        borderRadius: 'var(--radius-lg)',
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        flexWrap: 'wrap' as const,
      }}
    >
      {/* Left: status dot + title + subtitle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
        <div
          style={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            background: proof.approved ? 'var(--teal)' : 'hsl(0, 72%, 51%)',
            flexShrink: 0,
          }}
        />
        <span
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: 'var(--text-1)',
            letterSpacing: '-0.02em',
            whiteSpace: 'nowrap' as const,
          }}
        >
          {proof.companyName} — Invoice {proof.approved ? 'Approved' : 'Rejected'}
        </span>
        <span
          style={{
            fontSize: 11,
            color: 'var(--text-3)',
            whiteSpace: 'nowrap' as const,
          }}
        >
          InvoiceFactoring · {proof.timestamp.slice(0, 10)} · {proof.timestamp.slice(11, 16)} UTC
        </span>
      </div>

      {/* Right: pills */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
        <Pill label="Decision" value={proof.approved ? 'Approved' : 'Rejected'} />
        <Pill label="Score" value={`${proof.score}/100`} />
        <Pill label="Confidence" value={`${proof.confidence}%`} />
      </div>
    </div>
  )
}

function Pill({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column' as const,
        gap: 1,
        background: 'var(--accent-bg)',
        border: '1px solid var(--border-soft)',
        borderRadius: 4,
        padding: '6px 12px',
      }}
    >
      <div
        style={{
          fontSize: 9,
          fontWeight: 600,
          letterSpacing: '0.1em',
          textTransform: 'uppercase' as const,
          color: 'var(--text-3)',
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 13,
          fontWeight: 700,
          color: 'var(--text-1)',
          letterSpacing: '-0.02em',
        }}
      >
        {value}
      </div>
    </div>
  )
}
