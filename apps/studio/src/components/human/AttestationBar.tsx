import type { Proof } from '@/types/proof'

interface Props {
  proof: Proof
}

const ARC_EXPLORER = 'https://testnet.arcscan.app'

export function AttestationBar({ proof }: Props) {
  const txShort = proof.txHash.startsWith('0x')
    ? `${proof.txHash.slice(0, 8)}…${proof.txHash.slice(-6)}`
    : proof.txHash

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
      <AttestItem label="Prover">{proof.prover}</AttestItem>
      <Sep />
      <AttestItem label="Consensus">
        {proof.consensus.agreed} / {proof.consensus.total} nodes
      </AttestItem>
      <Sep />
      <AttestItem label="Block">Arc {proof.blockNumber.toLocaleString()}</AttestItem>
      <Sep />
      <AttestItem label="Tx" mono>
        {proof.txHash.startsWith('0x') ? (
          <a
            href={`${ARC_EXPLORER}/tx/${proof.txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--teal)', textDecoration: 'none' }}
          >
            {txShort} ↗
          </a>
        ) : (
          txShort
        )}
      </AttestItem>
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
