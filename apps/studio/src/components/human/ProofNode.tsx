'use client'

import { memo } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'

type ProofNodeData = {
  label: string
  meta?: string
  badge?: string
  status: 'completed' | 'pending' | 'failed' | 'attested' | 'on-chain' | 'released'
}

function ProofNodeComponent({ data }: NodeProps) {
  const d = data as unknown as ProofNodeData

  const isCompleted = d.status === 'completed' || d.status === 'attested'
  const isFailed = d.status === 'failed'
  const isOnChain = d.status === 'on-chain'
  const isReleased = d.status === 'released'
  const isPending = d.status === 'pending'
  const showBadge = d.badge && !isPending && !isFailed

  const iconColor = isOnChain
    ? 'hsl(240, 60%, 52%)'
    : isReleased
    ? 'hsl(142, 60%, 38%)'
    : isCompleted
    ? 'var(--teal)'
    : isFailed
    ? 'hsl(0, 72%, 51%)'
    : 'var(--text-3)'

  const iconBg = isOnChain
    ? 'hsl(240, 60%, 97%)'
    : isReleased
    ? 'hsl(142, 60%, 95%)'
    : isCompleted
    ? 'hsl(180, 85%, 97%)'
    : isFailed
    ? 'hsl(0, 72%, 97%)'
    : 'var(--accent-bg)'

  const iconBorder = isOnChain
    ? 'hsl(240, 60%, 88%)'
    : isReleased
    ? 'hsl(142, 60%, 82%)'
    : isCompleted
    ? 'hsl(180, 85%, 88%)'
    : isFailed
    ? 'hsl(0, 72%, 88%)'
    : 'var(--border-soft)'

  const badgeBg = isOnChain
    ? 'hsl(240, 60%, 97%)'
    : isReleased
    ? 'hsl(142, 60%, 95%)'
    : 'hsl(180, 85%, 97%)'

  const badgeBorder = isOnChain
    ? 'hsl(240, 60%, 82%)'
    : isReleased
    ? 'hsl(142, 60%, 78%)'
    : 'hsl(180, 85%, 85%)'

  const badgeColor = isOnChain
    ? 'hsl(240, 60%, 44%)'
    : isReleased
    ? 'hsl(142, 60%, 30%)'
    : 'var(--teal)'

  return (
    <div
      style={{
        background: 'var(--surface)',
        border: `1px solid ${isOnChain || isReleased ? iconBorder : 'var(--border-soft)'}`,
        borderRadius: 8,
        padding: '12px 14px',
        width: 260,
        fontFamily: 'Inter, system-ui, sans-serif',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        position: 'relative',
      }}
    >
      <Handle type="target" position={Position.Top} style={{ opacity: 0, pointerEvents: 'none' }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {/* Icon */}
        <div
          style={{
            width: 30,
            height: 30,
            flexShrink: 0,
            background: iconBg,
            border: `1px solid ${iconBorder}`,
            borderRadius: 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: iconColor,
          }}
        >
          {isCompleted ? (
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="2,8 6,12 14,4" />
            </svg>
          ) : isOnChain ? (
            // Shield / signature verified icon
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 2L3 4.5V8c0 3 2.5 4.8 5 5.5 2.5-.7 5-2.5 5-5.5V4.5L8 2z" />
              <polyline points="5.5,8 7,9.5 10.5,6" />
            </svg>
          ) : isReleased ? (
            // Arrow right / transfer icon
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="2" y1="8" x2="12" y2="8" />
              <polyline points="9,5 12,8 9,11" />
              <line x1="14" y1="5" x2="14" y2="11" />
            </svg>
          ) : isFailed ? (
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="4" y1="4" x2="12" y2="12" />
              <line x1="12" y1="4" x2="4" y2="12" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <circle cx="8" cy="8" r="3" />
            </svg>
          )}
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: 'var(--text-1)',
              lineHeight: 1.3,
            }}
          >
            {d.label}
          </div>
          {d.meta && (
            <div
              style={{
                fontSize: 10,
                color: 'var(--text-3)',
                marginTop: 2,
                whiteSpace: 'nowrap' as const,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {d.meta}
            </div>
          )}
        </div>

        {/* Badge */}
        {showBadge && (
          <div
            style={{
              flexShrink: 0,
              background: badgeBg,
              border: `1px solid ${badgeBorder}`,
              borderRadius: 100,
              padding: '2px 7px',
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase' as const,
              color: badgeColor,
            }}
          >
            {d.badge}
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} style={{ opacity: 0, pointerEvents: 'none' }} />
    </div>
  )
}

export const ProofNode = memo(ProofNodeComponent)
