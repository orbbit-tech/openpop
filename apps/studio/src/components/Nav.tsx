const ARC_EXPLORER = 'https://testnet.arcscan.app'

interface NavProps {
  onOpen: () => void
  txHash: string
  onInvest?: () => void
}

export function Nav({ onOpen, txHash, onInvest }: NavProps) {
  const explorerUrl = `${ARC_EXPLORER}/tx/${txHash}`
  return (
    <nav
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border-soft)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 32px',
        height: 52,
      }}
    >
      {/* Left: logo + proof ID */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <a href="#" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/openpop-logo.svg" alt="OpenPop" style={{ height: 28, width: 'auto' }} />
        </a>

        <span
          style={{
            fontFamily: 'monospace',
            fontSize: 11,
            color: 'var(--text-3)',
            padding: '3px 8px',
            border: '1px solid var(--border-soft)',
            borderRadius: 100,
            background: 'var(--surface)',
          }}
        >
          proof / gallivant-001
        </span>
      </div>

      {/* Right: Invest button + For Agents button + on-chain link */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {onInvest && (
          <button
            onClick={onInvest}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
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
              transition: 'color .12s, border-color .12s',
            }}
          >
            Invest
          </button>
        )}
        <button
          onClick={onOpen}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
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
            transition: 'color .12s, border-color .12s',
          }}
        >
          For Agents
        </button>

        <a
          href={explorerUrl}
          target="_blank"
          rel="noopener noreferrer"
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
            textDecoration: 'none',
          }}
        >
          View on-chain ↗
        </a>
      </div>
    </nav>
  )
}
