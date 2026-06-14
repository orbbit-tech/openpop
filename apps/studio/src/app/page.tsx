import { MOCK_PROOF } from '@/lib/fixtures'
import { Nav } from '@/components/Nav'

export default function DealsPage() {
  const deals = [MOCK_PROOF]

  return (
    <>
      <Nav />
      <div
        style={{
          maxWidth: 720,
          width: '100%',
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
              gridTemplateColumns: '1fr 90px',
              padding: '8px 16px',
              borderBottom: '1px solid var(--border-soft)',
              gap: 12,
            }}
          >
            {['Company', 'Verified'].map((h) => (
              <span
                key={h}
                style={{
                  fontSize: 9,
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase' as const,
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
                gridTemplateColumns: '1fr 90px',
                padding: '12px 16px',
                gap: 12,
                alignItems: 'center',
                textDecoration: 'none',
                borderBottom: i < deals.length - 1 ? '1px solid var(--border-soft)' : undefined,
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>
                  {deal.companyName}
                </span>
                <span style={{ fontSize: 10, color: 'var(--text-3)', fontFamily: 'monospace' }}>
                  deal-{String(deal.dealId ?? 1).padStart(3, '0')}
                </span>
              </div>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  height: 20,
                  padding: '0 8px',
                  borderRadius: 100,
                  fontSize: 11,
                  fontWeight: 600,
                  background: deal.approved ? 'hsla(180, 85%, 32%, 0.08)' : 'hsl(0, 72%, 92%)',
                  color: deal.approved ? 'hsl(180, 85%, 32%)' : 'hsl(0, 72%, 40%)',
                  width: 'fit-content',
                }}
              >
                {deal.approved ? 'Approved' : 'Rejected'}
              </span>
            </a>
          ))}
        </div>
      </div>
    </>
  )
}
