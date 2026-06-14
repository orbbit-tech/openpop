import { existsSync, readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { MOCK_PROOF } from '@/lib/fixtures'
import { Nav } from '@/components/Nav'
import type { Proof } from '@/types/proof'

type DealState = 'open' | 'settled' | 'rejected'

function getDealState(proof: Proof): DealState {
  if (!proof.approved) return 'rejected'
  if (!proof.txHash || proof.txHash === '—') return 'open'
  return 'settled'
}

function loadDeals(): Array<{ id: string; proof: Proof; state: DealState }> {
  const dir = path.join(process.cwd(), 'proofs')
  if (!existsSync(dir)) return [{ id: 'gallivant-001', proof: MOCK_PROOF, state: getDealState(MOCK_PROOF) }]
  const files = readdirSync(dir).filter((f) => f.endsWith('.json')).sort()
  if (files.length === 0) return [{ id: 'gallivant-001', proof: MOCK_PROOF, state: getDealState(MOCK_PROOF) }]
  return files.map((file) => {
    const id = file.replace(/\.json$/, '')
    try {
      const proof = JSON.parse(readFileSync(path.join(dir, file), 'utf-8')) as Proof
      return { id, proof, state: getDealState(proof) }
    } catch {
      return { id, proof: MOCK_PROOF, state: getDealState(MOCK_PROOF) }
    }
  })
}

function ScoreBar({ score }: { score: number }) {
  const color = score >= 80 ? 'hsl(180,85%,32%)' : score >= 60 ? 'hsl(38,90%,48%)' : 'hsl(0,72%,51%)'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div style={{ width: 48, height: 4, borderRadius: 2, background: 'var(--border-soft)', overflow: 'hidden' }}>
        <div style={{ width: `${score}%`, height: '100%', background: color, borderRadius: 2 }} />
      </div>
      <span style={{ fontSize: 11, fontWeight: 600, color, fontVariantNumeric: 'tabular-nums' }}>{score}</span>
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: 'var(--text-3)', marginBottom: 8 }}>
      {children}
    </div>
  )
}

function DealRow({ id, proof, state, last }: { id: string; proof: Proof; state: DealState; last: boolean }) {
  const isOpen = state === 'open'
  const isSettled = state === 'settled'

  const dotColor = isOpen ? 'hsl(180,85%,32%)' : 'hsl(220,9%,60%)'

  return (
    <a
      href={`/deals/${id}`}
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 130px 80px 28px',
        padding: '12px 16px',
        gap: 12,
        alignItems: 'center',
        textDecoration: 'none',
        borderBottom: last ? undefined : '1px solid var(--border-soft)',
      }}
    >
      {/* Company */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
        <div style={{ width: 6, height: 6, borderRadius: '50%', flexShrink: 0, background: dotColor }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {proof.companyName}
          </span>
          <span style={{ fontSize: 10, color: 'var(--text-3)' }}>{proof.invoiceAmount}</span>
        </div>
      </div>

      {/* Score bar */}
      <ScoreBar score={proof.score} />

      {/* Status */}
      {isOpen && (
        <span style={{
          display: 'inline-flex', alignItems: 'center', height: 20, padding: '0 8px',
          borderRadius: 100, fontSize: 11, fontWeight: 600, width: 'fit-content',
          background: 'hsla(180,85%,32%,0.08)', color: 'hsl(180,85%,28%)',
          border: '1px solid hsla(180,85%,32%,0.15)',
        }}>
          Open
        </span>
      )}
      {isSettled && (
        <span style={{
          display: 'inline-flex', alignItems: 'center', height: 20, padding: '0 8px',
          borderRadius: 100, fontSize: 11, fontWeight: 600, width: 'fit-content',
          background: 'hsl(220,14%,94%)', color: 'hsl(220,9%,42%)',
        }}>
          Settled
        </span>
      )}
      {/* Arrow */}
      <span style={{ fontSize: 12, color: 'var(--text-3)', textAlign: 'right' as const }}>→</span>
    </a>
  )
}

function DealCard({ deals, state }: { deals: Array<{ id: string; proof: Proof; state: DealState }>; state: DealState }) {
  if (deals.length === 0) return null
  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border-soft)',
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
    }}>
      {/* Column headers */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 130px 80px 28px',
        padding: '8px 16px', borderBottom: '1px solid var(--border-soft)', gap: 12,
      }}>
        {['Company / Invoice', 'Score', 'Status', ''].map((h, i) => (
          <span key={i} style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: 'var(--text-3)' }}>
            {h}
          </span>
        ))}
      </div>
      {deals.map(({ id, proof }, i) => (
        <DealRow key={id} id={id} proof={proof} state={state} last={i === deals.length - 1} />
      ))}
    </div>
  )
}

export default function DealsPage() {
  const all = loadDeals()
  const settled = all.filter(d => d.state === 'settled')
  const open = all.filter(d => d.state === 'open')

  return (
    <>
      <Nav />
      <div style={{
        maxWidth: 720, width: '100%', margin: '0 auto',
        padding: '32px 24px 64px', display: 'flex', flexDirection: 'column', gap: 28,
      }}>

        {settled.length > 0 && (
          <section>
            <SectionLabel>My Investments</SectionLabel>
            <DealCard deals={settled} state="settled" />
          </section>
        )}

        {open.length > 0 && (
          <section>
            <SectionLabel>Available to Fund — {open.length} open</SectionLabel>
            <DealCard deals={open} state="open" />
          </section>
        )}

      </div>
    </>
  )
}
