'use client'

import { memo } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'

type ProofNodeData = {
  label: string
  meta?: string
  badge?: string
  status: 'completed' | 'pending' | 'failed'
}

function ProofNodeComponent({ data }: NodeProps) {
  const d = data as unknown as ProofNodeData
  const isCompleted = d.status === 'completed'
  const isFailed = d.status === 'failed'

  const iconColor = isCompleted ? 'var(--teal)' : isFailed ? 'hsl(0, 72%, 51%)' : 'var(--text-3)'
  const iconBg = isCompleted
    ? 'hsl(180, 85%, 97%)'
    : isFailed
    ? 'hsl(0, 72%, 97%)'
    : 'var(--accent-bg)'
  const iconBorder = isCompleted
    ? 'hsl(180, 85%, 88%)'
    : isFailed
    ? 'hsl(0, 72%, 88%)'
    : 'var(--border-soft)'

  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border-soft)',
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
        {d.badge && isCompleted && (
          <div
            style={{
              flexShrink: 0,
              background: 'hsl(180, 85%, 97%)',
              border: '1px solid hsl(180, 85%, 85%)',
              borderRadius: 100,
              padding: '2px 7px',
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase' as const,
              color: 'var(--teal)',
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
