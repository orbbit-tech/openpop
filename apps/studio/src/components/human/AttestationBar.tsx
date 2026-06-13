import type { Receipt } from '@/types/receipt'

interface Props {
  receipt: Receipt
}

export function AttestationBar({ receipt }: Props) {
  const txShort = `${receipt.txHash.slice(0, 6)}…${receipt.txHash.slice(-4)}`

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        flexWrap: 'wrap' as const,
        padding: '12px 16px',
        background: 'var(--surface)',
        border: '1px solid var(--border-soft)',
        borderRadius: 'var(--radius-md)',
        fontSize: 11,
        color: 'var(--text-2)',
      }}
    >
      <AttestItem label="Prover">{receipt.prover}</AttestItem>
      <Sep />
      <AttestItem label="Consensus">
        {receipt.consensus.agreed} / {receipt.consensus.total} nodes
      </AttestItem>
      <Sep />
      <AttestItem label="Block">Arc {receipt.blockNumber.toLocaleString()}</AttestItem>
      <Sep />
      <AttestItem label="Tx" mono>{txShort}</AttestItem>
    </div>
  )
}

function AttestItem({
  label,
  children,
  mono,
}: {
  label: string
  children: React.ReactNode
  mono?: boolean
}) {
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
      <span
        style={{
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: '0.1em',
          textTransform: 'uppercase' as const,
          color: 'var(--text-3)',
        }}
      >
        {label}
      </span>
      <span
        style={
          mono
            ? { fontFamily: 'monospace', fontSize: 10 }
            : undefined
        }
      >
        {children}
      </span>
    </span>
  )
}

function Sep() {
  return (
    <span style={{ color: 'var(--border-soft)' }}>·</span>
  )
}
