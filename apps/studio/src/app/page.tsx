import { MOCK_PROOF } from '@/lib/fixtures'
import { Nav } from '@/components/Nav'

export default function DealsPage() {
  const deals = [MOCK_PROOF]

  return (
    <>
      <Nav />
      <div
        style={{
          maxWidth: 820,
          margin: '0 auto',
          padding: '32px 24px 64px',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        <h1
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: 'var(--text-1)',
            letterSpacing: '-0.02em',
            margin: 0,
          }}
        >
          Verified Deals
        </h1>

        <div
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border-soft)',
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
          }}
        >
          {/* Header row */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 100px 100px 110px 28px',
              padding: '8px 16px',
              borderBottom: '1px solid var(--border-soft)',
              gap: 12,
            }}
          >
            {['Company', 'Score', 'Verdict', 'Date', ''].map((h) => (
              <span
                key={h}
                style={{
                  fontSize: 9,
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: 'var(--text-3)',
                }}
              >
                {h}
              </span>
            ))}
          </div>

          {/* Deal rows */}
          {deals.map((deal, i) => (
            <a
              key={i}
              href="/deals/gallivant-001"
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 100px 100px 110px 28px',
                padding: '12px 16px',
                gap: 12,
                alignItems: 'center',
                textDecoration: 'none',
                borderBottom: i < deals.length - 1 ? '1px solid var(--border-soft)' : undefined,
              }}
            >
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>
                {deal.companyName}
              </span>
              <span style={{ fontSize: 13, color: 'var(--text-2)' }}>
                {deal.score}/100
              </span>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  height: 20,
                  padding: '0 8px',
                  borderRadius: 100,
                  fontSize: 11,
                  fontWeight: 600,
                  background: deal.approved ? 'hsl(142, 71%, 92%)' : 'hsl(0, 72%, 92%)',
                  color: deal.approved ? 'hsl(142, 71%, 30%)' : 'hsl(0, 72%, 40%)',
                  width: 'fit-content',
                }}
              >
                {deal.approved ? 'Approved' : 'Rejected'}
              </span>
              <span style={{ fontSize: 12, color: 'var(--text-3)', fontFamily: 'monospace' }}>
                {deal.timestamp.slice(0, 10)}
              </span>
              <span style={{ fontSize: 14, color: 'var(--text-3)' }}>→</span>
            </a>
          ))}
        </div>
      </div>
    </>
  )
}
