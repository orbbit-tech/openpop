'use client'

import { memo } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'

type ProofNodeData = {
  label: string
  badge?: string
  status: 'completed' | 'pending' | 'failed' | 'attested' | 'on-chain' | 'released'
  href?: string
}

const PRIMARY = 'hsl(180, 85%, 32%)'
const PRIMARY_BG = 'hsla(180, 85%, 32%, 0.06)'
const PRIMARY_BORDER = 'hsla(180, 85%, 32%, 0.2)'

function SpinnerIcon() {
  return (
    <>
      <style>{`@keyframes pn-spin { to { transform: rotate(360deg) } }`}</style>
      <svg
        width="14" height="14" viewBox="0 0 14 14" fill="none"
        style={{ animation: 'pn-spin 1s linear infinite' }}
      >
        <circle cx="7" cy="7" r="5.5" stroke="#cbd5e1" strokeWidth="1.8" />
        <path d="M7 1.5a5.5 5.5 0 0 1 5.5 5.5" stroke="#94a3b8" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    </>
  )
}

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="2,8 6,12 14,4" />
    </svg>
  )
}

function ProofNodeComponent({ data }: NodeProps) {
  const d = data as unknown as ProofNodeData

  const isPositive = d.status === 'completed' || d.status === 'attested' || d.status === 'on-chain' || d.status === 'released'
  const isFailed = d.status === 'failed'
  const isPending = d.status === 'pending'
  const isNeutral = d.badge === 'Trigger'
  const showBadge = d.badge && !isPending
  const isClickable = !!d.href

  const iconColor = isPositive ? PRIMARY : isFailed ? 'hsl(0, 55%, 50%)' : '#94a3b8'
  const iconBg = isPositive ? PRIMARY_BG : isFailed ? 'hsl(0, 20%, 97%)' : '#f8fafc'
  const iconBorder = isPositive ? PRIMARY_BORDER : isFailed ? 'hsl(0, 40%, 88%)' : '#e2e8f0'

  const badgeBg = isNeutral ? 'var(--accent-bg)' : PRIMARY_BG
  const badgeBorder = isNeutral ? 'var(--border-soft)' : PRIMARY_BORDER
  const badgeColor = isNeutral ? 'var(--text-3)' : PRIMARY

  return (
    <div
      style={{
        background: isPending ? '#f8fafc' : 'var(--surface)',
        border: isPending
          ? '1.5px dashed #cbd5e1'
          : `1px solid ${isPositive && !isNeutral ? PRIMARY_BORDER : 'var(--border-soft)'}`,
        borderRadius: 8,
        padding: '11px 14px',
        width: 340,
        fontFamily: 'Inter, system-ui, sans-serif',
        boxShadow: isPending ? 'none' : '0 1px 2px rgba(0,0,0,0.04)',
        cursor: isClickable ? 'pointer' : 'default',
      }}
    >
      <Handle type="target" position={Position.Top} style={{ opacity: 0, pointerEvents: 'none' }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {/* Status icon */}
        <div
          style={{
            width: 26, height: 26, flexShrink: 0,
            background: iconBg,
            border: `1px solid ${iconBorder}`,
            borderRadius: 4,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: iconColor,
          }}
        >
          {isPending ? (
            <SpinnerIcon />
          ) : isPositive ? (
            d.status === 'on-chain' ? (
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 2L3 4.5V8c0 3 2.5 4.8 5 5.5 2.5-.7 5-2.5 5-5.5V4.5L8 2z" />
                <polyline points="5.5,8 7,9.5 10.5,6" />
              </svg>
            ) : d.status === 'released' ? (
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="2" y1="8" x2="12" y2="8" />
                <polyline points="9,5 12,8 9,11" />
                <line x1="14" y1="5" x2="14" y2="11" />
              </svg>
            ) : (
              <CheckIcon />
            )
          ) : isFailed ? (
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="4" y1="4" x2="12" y2="12" /><line x1="12" y1="4" x2="4" y2="12" />
            </svg>
          ) : null}
        </div>

        {/* Label */}
        <div style={{
          flex: 1, fontSize: 12, fontWeight: 600, lineHeight: 1.35,
          color: isPending ? '#94a3b8' : 'var(--text-1)',
        }}>
          {d.label}
        </div>

        {/* Badge + link indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
          {showBadge && (
            <div style={{
              background: badgeBg, border: `1px solid ${badgeBorder}`, borderRadius: 100,
              padding: '2px 7px', fontSize: 10, fontWeight: 600,
              letterSpacing: '0.02em', color: badgeColor,
            }}>
              {d.badge}
            </div>
          )}
          {isClickable && (
            <span style={{ fontSize: 9, color: 'var(--text-3)', lineHeight: 1 }}>↗</span>
          )}
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} style={{ opacity: 0, pointerEvents: 'none' }} />
    </div>
  )
}

export const ProofNode = memo(ProofNodeComponent)
