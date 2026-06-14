'use client'

import { memo, useMemo } from 'react'
import { ReactFlow, Controls, Handle, Position, type Node, type Edge, type NodeTypes, type NodeProps } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { ProofNode } from './ProofNode'
import type { Proof } from '@/types/proof'

const ARC_EXPLORER = 'https://testnet.arcscan.app'

// CRE TEE group container — gray dashed box, no handles, no pointer events
function CREGroupNodeComponent({ data }: NodeProps) {
  const d = data as { execShort?: string }
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        border: '1.5px dashed hsla(180, 85%, 32%, 0.22)',
        borderRadius: 10,
        background: 'hsla(180, 85%, 32%, 0.03)',
        position: 'relative',
        pointerEvents: 'none',
      }}
    >
      {/* Top-right label */}
      <div
        style={{
          position: 'absolute',
          top: 10,
          right: 12,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: 3,
        }}
      >
        <div
          style={{
            padding: '2px 7px',
            background: 'hsla(180, 85%, 32%, 0.07)',
            border: '1px solid hsla(180, 85%, 32%, 0.2)',
            borderRadius: 4,
            fontSize: 8,
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase' as const,
            color: 'var(--teal)',
          }}
        >
          CRE · TEE
        </div>
        {d.execShort && (
          <span style={{ fontSize: 8, color: 'hsla(180, 85%, 32%, 0.5)', fontFamily: 'monospace' }}>
            {d.execShort}
          </span>
        )}
      </div>
    </div>
  )
}

const CREGroupNode = memo(CREGroupNodeComponent)

// Minimal zone boundary — separates off-chain from on-chain
function ZoneBoundaryNodeComponent({ data }: NodeProps) {
  const d = data as { consensus: string; txShort: string }
  return (
    <div style={{ width: 380, position: 'relative' }}>
      <Handle type="target" position={Position.Top} style={{ opacity: 0, pointerEvents: 'none' }} />
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '7px 14px',
          background: 'var(--surface)',
          border: '1px solid var(--border-soft)',
          borderRadius: 8,
          gap: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <div
            style={{
              width: 14, height: 14, borderRadius: '50%',
              background: 'hsl(170, 25%, 94%)',
              border: '1px solid hsl(170, 25%, 78%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}
          >
            <svg width="7" height="7" viewBox="0 0 16 16" fill="none" stroke="hsl(170, 35%, 42%)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="2,8 6,12 14,4" />
            </svg>
          </div>
          <span style={{ fontSize: 10, fontWeight: 500, color: 'var(--text-2)', letterSpacing: '0.01em' }}>
            {d.consensus} · BFT report signed
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          <div
            style={{
              width: 1, height: 12,
              background: 'var(--border-soft)',
            }}
          />
          <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: 'var(--text-3)' }}>
            Arc Testnet
          </span>
          <span style={{ fontSize: 9, color: 'var(--text-3)', fontFamily: 'monospace' }}>
            {d.txShort}
          </span>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0, pointerEvents: 'none' }} />
    </div>
  )
}

const ZoneBoundaryNode = memo(ZoneBoundaryNodeComponent)

const nodeTypes: NodeTypes = {
  proofNode: ProofNode,
  creGroup: CREGroupNode,
  zoneBoundary: ZoneBoundaryNode,
}

const NODE_W = 340           // ProofNode width
const GROUP_PAD_H = 24       // horizontal padding inside group each side
const GROUP_W = NODE_W + GROUP_PAD_H * 2  // = 388
const GROUP_STEP_GAP = 76    // vertical gap between child node tops
const GROUP_PAD_TOP = 44     // room for CRE · TEE label
const GROUP_PAD_BOT = 20
const NODE_H = 52            // node height without subtitle line

interface Props {
  proof: Proof
}

export function WorkflowCanvas({ proof }: Props) {
  const txUrl = `${ARC_EXPLORER}/tx/${proof.txHash}`
  const txLogsUrl = `${txUrl}?tab=logs`

  const txShort = proof.txHash.startsWith('0x')
    ? `${proof.txHash.slice(0, 8)}…${proof.txHash.slice(-4)}`
    : proof.txHash

  const execShort = proof.workflowExecutionId
    ? `${proof.workflowExecutionId.slice(0, 8)}…${proof.workflowExecutionId.slice(-4)}`
    : undefined

  // Correct group height: last step's bottom + bottom padding
  const groupH = GROUP_PAD_TOP + (proof.steps.length - 1) * GROUP_STEP_GAP + NODE_H + GROUP_PAD_BOT

  // Vertical positions (all root nodes at x=0, centered via nodeOrigin [0.5, 0])
  const TRIGGER_Y = 0
  const GROUP_Y = NODE_H + 48
  const BOUNDARY_Y = GROUP_Y + groupH + 36
  const SIG_Y = BOUNDARY_Y + 44
  const USDC_Y = SIG_Y + NODE_H + 24

  const nodes: Node[] = useMemo(() => [
    {
      id: 'trigger',
      type: 'proofNode',
      position: { x: 0, y: TRIGGER_Y },
      data: {
        label: 'Invoice Submitted',
        badge: 'Trigger',
        status: 'completed',
      },
    },
    {
      id: 'cre-group',
      type: 'creGroup',
      position: { x: 0, y: GROUP_Y },
      data: { execShort },
      style: { width: GROUP_W, height: groupH },
    },
    ...proof.steps.map((step, i) => ({
      id: `step-${i}`,
      type: 'proofNode',
      parentId: 'cre-group',
      extent: 'parent' as const,
      // center child within group — nodeOrigin [0.5, 0] applies here too
      position: { x: GROUP_W / 2, y: GROUP_PAD_TOP + i * GROUP_STEP_GAP },
      data: {
        label: step.label,
        badge: step.status === 'completed' ? 'Attested' : step.status === 'failed' ? 'Failed' : 'Pending',
        status: step.status,
        href: txLogsUrl,
      },
    })),
    {
      id: 'zone-boundary',
      type: 'zoneBoundary',
      position: { x: 0, y: BOUNDARY_Y },
      data: {
        consensus: `${proof.consensus.agreed}/${proof.consensus.total} nodes`,
        txShort,
      },
    },
    {
      id: 'sig-verified',
      type: 'proofNode',
      position: { x: 0, y: SIG_Y },
      data: {
        label: 'Execution Proof Verified',
        badge: 'On-Chain',
        status: 'on-chain',
        href: txUrl,
      },
    },
    {
      id: 'usdc-released',
      type: 'proofNode',
      position: { x: 0, y: USDC_Y },
      data: {
        label: 'USDC Released from Escrow',
        badge: 'Released',
        status: 'released',
        href: txUrl,
      },
    },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [proof, execShort, txLogsUrl, txUrl, txShort, groupH, GROUP_Y, BOUNDARY_Y, SIG_Y, USDC_Y])

  const edges: Edge[] = useMemo(() => {
    const soft = { stroke: 'hsla(180, 85%, 32%, 0.28)', strokeWidth: 1.5 }
    const dashed = { ...soft, strokeDasharray: '4 3' }

    return [
      { id: 'e-0', source: 'trigger', target: 'step-0', type: 'smoothstep', style: soft },
      ...proof.steps.slice(1).map((_, i) => ({
        id: `e-step-${i}`,
        source: `step-${i}`,
        target: `step-${i + 1}`,
        type: 'smoothstep',
        style: soft,
      })),
      { id: 'e-exit', source: `step-${proof.steps.length - 1}`, target: 'zone-boundary', type: 'smoothstep', style: dashed },
      { id: 'e-cross', source: 'zone-boundary', target: 'sig-verified', type: 'smoothstep', style: dashed },
      { id: 'e-z2', source: 'sig-verified', target: 'usdc-released', type: 'smoothstep', style: soft },
    ]
  }, [proof])

  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border-soft)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        height: '100%',
      }}
    >
      {/* Suppress ReactFlow's selection outline since we handle clicks ourselves */}
      <style>{`.react-flow__node.selected { box-shadow: none !important; outline: none !important; }`}</style>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        nodesDraggable={false}
        nodesConnectable={false}
        deleteKeyCode={null}
        panOnDrag={true}
        zoomOnScroll={true}
        zoomOnPinch={true}
        nodeOrigin={[0.5, 0]}
        fitView
        fitViewOptions={{ padding: 0.2, maxZoom: 1.0 }}
        proOptions={{ hideAttribution: true }}
        style={{ background: 'var(--accent-bg)' }}
        onNodeClick={(_event, node) => {
          const href = (node.data as { href?: string }).href
          if (href) window.open(href, '_blank', 'noopener,noreferrer')
        }}
      >
        <Controls
          showInteractive={false}
          style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid var(--border-soft)' }}
        />
      </ReactFlow>
    </div>
  )
}
