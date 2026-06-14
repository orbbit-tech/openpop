'use client'

import type { Proof } from '@/types/proof'

const ARC_EXPLORER = 'https://testnet.arcscan.app'

interface Props {
  proof: Proof
}

function CheckIcon({ color = 'var(--teal)' }: { color?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="2,8 6,12 14,4" />
    </svg>
  )
}

function ShieldIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="hsl(240, 60%, 52%)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 2L3 4.5V8c0 3 2.5 4.8 5 5.5 2.5-.7 5-2.5 5-5.5V4.5L8 2z" />
      <polyline points="5.5,8 7,9.5 10.5,6" />
    </svg>
  )
}

function ReleaseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="hsl(142, 60%, 38%)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="2" y1="8" x2="12" y2="8" />
      <polyline points="9,5 12,8 9,11" />
      <line x1="14" y1="5" x2="14" y2="11" />
    </svg>
  )
}

type RowVariant = 'trigger' | 'attested' | 'on-chain' | 'released'

const VARIANT_STYLES: Record<RowVariant, {
  iconBg: string; iconBorder: string
  badgeBg: string; badgeBorder: string; badgeColor: string
}> = {
  trigger: {
    iconBg: 'hsl(180, 85%, 97%)', iconBorder: 'hsl(180, 85%, 88%)',
    badgeBg: 'hsl(180, 85%, 97%)', badgeBorder: 'hsl(180, 85%, 85%)', badgeColor: 'var(--teal)',
  },
  attested: {
    iconBg: 'hsl(180, 85%, 97%)', iconBorder: 'hsl(180, 85%, 88%)',
    badgeBg: 'hsl(180, 85%, 97%)', badgeBorder: 'hsl(180, 85%, 85%)', badgeColor: 'var(--teal)',
  },
  'on-chain': {
    iconBg: 'hsl(240, 60%, 97%)', iconBorder: 'hsl(240, 60%, 88%)',
    badgeBg: 'hsl(240, 60%, 97%)', badgeBorder: 'hsl(240, 60%, 82%)', badgeColor: 'hsl(240, 60%, 44%)',
  },
  released: {
    iconBg: 'hsl(142, 60%, 95%)', iconBorder: 'hsl(142, 60%, 82%)',
    badgeBg: 'hsl(142, 60%, 95%)', badgeBorder: 'hsl(142, 60%, 78%)', badgeColor: 'hsl(142, 60%, 30%)',
  },
}

function Row({
  label, meta, badge, icon, variant, href, showDivider = true,
}: {
  label: string
  meta?: string
  badge: string
  icon: React.ReactNode
  variant: RowVariant
  href?: string
  showDivider?: boolean
}) {
  const s = VARIANT_STYLES[variant]
  const inner = (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '11px 16px',
        borderBottom: showDivider ? '1px solid var(--border-soft)' : 'none',
        cursor: href ? 'pointer' : 'default',
      }}
    >
      <div
        style={{
          width: 30, height: 30, flexShrink: 0,
          background: s.iconBg, border: `1px solid ${s.iconBorder}`,
          borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        {icon}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-1)', lineHeight: 1.3 }}>
          {label}
        </div>
        {meta && (
          <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>
            {meta}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
        <div
          style={{
            background: s.badgeBg, border: `1px solid ${s.badgeBorder}`,
            borderRadius: 100, padding: '2px 7px',
            fontSize: 9, fontWeight: 700, letterSpacing: '0.06em',
            textTransform: 'uppercase' as const, color: s.badgeColor,
          }}
        >
          {badge}
        </div>
        {href && (
          <span style={{ fontSize: 11, color: 'var(--text-3)' }}>↗</span>
        )}
      </div>
    </div>
  )

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', display: 'block' }}>
        {inner}
      </a>
    )
  }
  return inner
}

function GroupCard({
  zoneLabel, zonePill, zonePillColor, meta, href, children,
}: {
  zoneLabel: string
  zonePill: string
  zonePillColor: { bg: string; border: string; color: string }
  meta?: string
  href?: string
  children: React.ReactNode
}) {
  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border-soft)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
      }}
    >
      {/* Group header */}
      <div
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '10px 16px',
          borderBottom: '1px solid var(--border-soft)',
          background: 'hsl(0,0%,99%)',
        }}
      >
        <div
          style={{
            padding: '2px 8px', borderRadius: 100,
            background: zonePillColor.bg, border: `1px solid ${zonePillColor.border}`,
            fontSize: 9, fontWeight: 700, letterSpacing: '0.08em',
            textTransform: 'uppercase' as const, color: zonePillColor.color,
          }}
        >
          {zonePill}
        </div>
        <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-2)' }}>
          {zoneLabel}
        </span>
        {meta && (
          <span style={{ fontSize: 10, color: 'var(--text-3)', fontFamily: 'monospace', marginLeft: 'auto' }}>
            {meta}
          </span>
        )}
        {href && (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: 10, color: 'var(--text-3)', textDecoration: 'none', marginLeft: meta ? 4 : 'auto' }}
          >
            ↗
          </a>
        )}
      </div>

      {children}
    </div>
  )
}

function ZoneBridge({ consensus, txShort }: { consensus: string; txShort: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
      {/* Top connector line */}
      <div style={{ width: 1, height: 16, borderLeft: '1px dashed hsl(220, 20%, 78%)' }} />

      {/* Bridge pill */}
      <div
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '6px 14px',
          background: 'linear-gradient(90deg, hsl(180,50%,97%) 0%, hsl(240,50%,97%) 100%)',
          border: '1px dashed hsl(220,25%,80%)',
          borderRadius: 100,
          fontSize: 9, fontWeight: 600, color: 'hsl(220, 30%, 52%)',
          letterSpacing: '0.03em',
          whiteSpace: 'nowrap' as const,
        }}
      >
        <span style={{ color: 'var(--teal)' }}>✓</span>
        {consensus} · report signed
        <span style={{ color: 'hsl(220,20%,70%)' }}>·</span>
        <span
          style={{
            padding: '1px 6px', borderRadius: 4,
            background: 'hsl(240,60%,97%)', border: '1px solid hsl(240,60%,82%)',
            color: 'hsl(240,60%,44%)', fontSize: 8, fontWeight: 700, letterSpacing: '0.06em',
            textTransform: 'uppercase' as const,
          }}
        >
          Arc
        </span>
        <span style={{ fontFamily: 'monospace', fontSize: 9, color: 'hsl(240,40%,58%)' }}>
          {txShort}
        </span>
      </div>

      {/* Bottom connector line */}
      <div style={{ width: 1, height: 16, borderLeft: '1px dashed hsl(220, 20%, 78%)' }} />
    </div>
  )
}

export function WorkflowCanvas({ proof }: Props) {
  const txUrl = `${ARC_EXPLORER}/tx/${proof.txHash}`
  const txShort = proof.txHash.startsWith('0x')
    ? `${proof.txHash.slice(0, 8)}…${proof.txHash.slice(-4)}`
    : proof.txHash
  const usdcAmount = proof.usdcReleasedAmount
    ? `${(proof.usdcReleasedAmount / 1_000_000).toFixed(0)} USDC`
    : 'USDC'
  const recipientShort = proof.recipient
    ? `${proof.recipient.slice(0, 6)}…${proof.recipient.slice(-4)}`
    : '—'
  const execShort = proof.workflowExecutionId
    ? `exec ${proof.workflowExecutionId.slice(0, 8)}…${proof.workflowExecutionId.slice(-4)}`
    : undefined

  const tealPill = { bg: 'hsl(180,85%,97%)', border: 'hsl(180,85%,85%)', color: 'var(--teal)' }
  const indigoPill = { bg: 'hsl(240,60%,97%)', border: 'hsl(240,60%,82%)', color: 'hsl(240,60%,44%)' }

  const allSteps = [
    { label: 'Invoice Submitted', meta: `${proof.companyName} · ${proof.invoiceAmount}`, variant: 'trigger' as const, href: undefined },
    ...proof.steps.map(s => ({
      label: s.label, meta: s.metadata, variant: 'attested' as const, href: `${txUrl}?tab=logs`,
    })),
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Zone 1: CRE TEE */}
      <GroupCard
        zonePill="CRE · TEE"
        zonePillColor={tealPill}
        zoneLabel="Private computation — inputs never leave the enclave"
        meta={execShort}
      >
        {allSteps.map((step, i) => (
          <Row
            key={step.label}
            label={step.label}
            meta={step.meta}
            badge={step.variant === 'trigger' ? 'Trigger' : 'Attested'}
            icon={<CheckIcon color={step.variant === 'trigger' ? 'var(--teal)' : 'var(--teal)'} />}
            variant={step.variant}
            href={step.href}
            showDivider={i < allSteps.length - 1}
          />
        ))}
      </GroupCard>

      {/* Zone bridge */}
      <ZoneBridge
        consensus={`${proof.consensus.agreed}/${proof.consensus.total} nodes`}
        txShort={txShort}
      />

      {/* Zone 2: Arc Testnet */}
      <GroupCard
        zonePill="Arc Testnet"
        zonePillColor={indigoPill}
        zoneLabel={`Block ${proof.blockNumber.toLocaleString()} · single tx`}
        meta={txShort}
        href={txUrl}
      >
        <Row
          label="Signature Verified"
          meta={proof.reportId ? `Report ${proof.reportId} · MockKeystoneForwarder` : 'MockKeystoneForwarder · BFT report accepted'}
          badge="On-Chain"
          icon={<ShieldIcon />}
          variant="on-chain"
          href={txUrl}
          showDivider
        />
        <Row
          label="USDC Released"
          meta={`${usdcAmount} → ${recipientShort} · ProofGatedEscrow`}
          badge="Released"
          icon={<ReleaseIcon />}
          variant="released"
          href={txUrl}
          showDivider={false}
        />
      </GroupCard>
    </div>
  )
}
