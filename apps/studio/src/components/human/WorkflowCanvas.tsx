'use client'

import { memo, useMemo } from 'react'
import { ReactFlow, Controls, Handle, Position, type Node, type Edge, type NodeTypes, type NodeProps } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { ProofNode } from './ProofNode'
import type { Proof } from '@/types/proof'

const ARC_EXPLORER = 'https://testnet.arcscan.app'

// CRE TEE group container — visual box only, no handles, children are real nodes
function CREGroupNodeComponent({ data }: NodeProps) {
  const d = data as { execShort?: string }
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        border: '1.5px dashed hsl(180, 45%, 68%)',
        borderRadius: 12,
        background: 'hsl(180, 70%, 99.2%)',
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
            background: 'hsl(180, 85%, 96%)',
            border: '1px solid hsl(180, 85%, 84%)',
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
          <span style={{ fontSize: 8, color: 'hsl(180, 40%, 60%)', fontFamily: 'monospace' }}>
            {d.execShort}
          </span>
        )}
      </div>
    </div>
  )
}

const CREGroupNode = memo(CREGroupNodeComponent)

// Zone boundary node — bridge between CRE TEE and Arc Testnet
function ZoneBoundaryNodeComponent({ data }: NodeProps) {
  const d = data as { consensus: string; txShort: string }
  return (
    <div style={{ width: 320, position: 'relative' }}>
      <Handle type="target" position={Position.Top} style={{ opacity: 0, pointerEvents: 'none' }} />
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '7px 14px',
          background: 'linear-gradient(90deg, hsl(180, 60%, 97%) 0%, hsl(240, 60%, 97%) 100%)',
          border: '1px dashed hsl(220, 30%, 80%)',
          borderRadius: 8,
          gap: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div
            style={{
              width: 15, height: 15, borderRadius: '50%',
              background: 'var(--teal)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}
          >
            <svg width="8" height="8" viewBox="0 0 16 16" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="2,8 6,12 14,4" />
            </svg>
          </div>
          <span style={{ fontSize: 9, fontWeight: 600, color: 'hsl(180, 50%, 32%)', letterSpacing: '0.03em' }}>
            {d.consensus} · report signed
          </span>
        </div>

        <svg width="16" height="8" viewBox="0 0 16 8" fill="none" style={{ flexShrink: 0 }}>
          <line x1="0" y1="4" x2="11" y2="4" stroke="hsl(220, 30%, 72%)" strokeWidth="1.5" />
          <polyline points="8,1.5 11,4 8,6.5" stroke="hsl(220, 30%, 72%)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>

        <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
          <div
            style={{
              padding: '2px 6px', borderRadius: 100,
              background: 'hsl(240, 60%, 97%)', border: '1px solid hsl(240, 60%, 82%)',
              fontSize: 8, fontWeight: 700, letterSpacing: '0.08em',
              textTransform: 'uppercase' as const, color: 'hsl(240, 60%, 44%)',
            }}
          >
            Arc Testnet
          </div>
          <span style={{ fontSize: 8, color: 'hsl(240, 40%, 58%)', fontFamily: 'monospace' }}>
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

const GROUP_W = 290
const GROUP_STEP_GAP = 100  // vertical spacing between child nodes
const GROUP_PAD_TOP = 44    // room for the CRE · TEE label
const GROUP_PAD_BOT = 24
const NODE_H = 66           // approximate ProofNode height

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

  const usdcAmount = proof.usdcReleasedAmount
    ? `${(proof.usdcReleasedAmount / 1_000_000).toFixed(0)} USDC`
    : 'USDC'

  const recipientShort = proof.recipient
    ? `${proof.recipient.slice(0, 6)}…${proof.recipient.slice(-4)}`
    : '—'

  // Group height: top pad + steps * gap + last node height + bottom pad
  const groupH = GROUP_PAD_TOP + proof.steps.length * GROUP_STEP_GAP + NODE_H + GROUP_PAD_BOT

  // Vertical layout (all root nodes centered at x=0 with nodeOrigin [0.5, 0])
  const TRIGGER_Y = 0
  const GROUP_Y = NODE_H + 50          // below trigger
  const BOUNDARY_Y = GROUP_Y + groupH + 40
  const SIG_Y = BOUNDARY_Y + 46
  const USDC_Y = SIG_Y + NODE_H + 28

  const nodes: Node[] = useMemo(() => [
    // — Trigger (outside the group) —
    {
      id: 'trigger',
      type: 'proofNode',
      position: { x: 0, y: TRIGGER_Y },
      data: {
        label: 'Invoice Submitted',
        meta: `${proof.companyName} · ${proof.invoiceAmount}`,
        badge: 'Trigger',
        status: 'completed',
      },
    },

    // — CRE TEE group container —
    {
      id: 'cre-group',
      type: 'creGroup',
      position: { x: 0, y: GROUP_Y },
      data: { execShort },
      style: { width: GROUP_W, height: groupH },
    },

    // — Child nodes inside group (positions relative to group top-left) —
    ...proof.steps.map((step, i) => ({
      id: `step-${i}`,
      type: 'proofNode',
      parentId: 'cre-group',
      extent: 'parent' as const,
      // Center child (240px wide) within group (GROUP_W px wide), nodeOrigin [0.5,0]
      position: { x: GROUP_W / 2, y: GROUP_PAD_TOP + i * GROUP_STEP_GAP },
      data: {
        label: step.label,
        meta: step.metadata,
        badge: step.status === 'completed' ? 'Attested' : step.status === 'failed' ? 'Failed' : 'Pending',
        status: step.status,
        href: txLogsUrl,
      },
    })),

    // — Zone boundary bridge —
    {
      id: 'zone-boundary',
      type: 'zoneBoundary',
      position: { x: 0, y: BOUNDARY_Y },
      data: {
        consensus: `${proof.consensus.agreed}/${proof.consensus.total} nodes`,
        txShort,
      },
    },

    // — Zone 2: Arc Testnet events —
    {
      id: 'sig-verified',
      type: 'proofNode',
      position: { x: 0, y: SIG_Y },
      data: {
        label: 'Execution Proof Verified',
        meta: proof.reportId
          ? `Report ${proof.reportId} · MockKeystoneForwarder`
          : 'MockKeystoneForwarder · BFT report accepted',
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
        meta: `${usdcAmount} → ${recipientShort} · ProofGatedEscrow`,
        badge: 'Released',
        status: 'released',
        href: txUrl,
      },
    },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [proof, execShort, txLogsUrl, txUrl, txShort, usdcAmount, recipientShort, groupH, GROUP_Y, BOUNDARY_Y, SIG_Y, USDC_Y])

  const edges: Edge[] = useMemo(() => {
    const teal = { stroke: 'hsl(180, 40%, 72%)', strokeWidth: 1.5 }
    const indigo = { stroke: 'hsl(240, 40%, 72%)', strokeWidth: 1.5 }

    return [
      // trigger → first CRE step (crosses into group)
      { id: 'e-0', source: 'trigger', target: 'step-0', type: 'smoothstep', style: teal },
      // steps within group
      ...proof.steps.slice(1).map((_, i) => ({
        id: `e-step-${i}`,
        source: `step-${i}`,
        target: `step-${i + 1}`,
        type: 'smoothstep',
        style: teal,
      })),
      // last step → zone boundary (exits group)
      {
        id: 'e-exit',
        source: `step-${proof.steps.length - 1}`,
        target: 'zone-boundary',
        type: 'smoothstep',
        style: { ...teal, strokeDasharray: '4 3' },
      },
      // zone boundary → sig-verified
      {
        id: 'e-cross',
        source: 'zone-boundary',
        target: 'sig-verified',
        type: 'smoothstep',
        style: { ...indigo, strokeDasharray: '4 3' },
      },
      // sig-verified → usdc-released
      { id: 'e-z2', source: 'sig-verified', target: 'usdc-released', type: 'smoothstep', style: indigo },
    ]
  }, [proof])

  const canvasH = USDC_Y + NODE_H + 80

  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border-soft)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        height: Math.max(canvasH, 680),
      }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        deleteKeyCode={null}
        panOnDrag={true}
        zoomOnScroll={true}
        zoomOnPinch={true}
        nodeOrigin={[0.5, 0]}
        fitView
        fitViewOptions={{ padding: 0.2, maxZoom: 1.1 }}
        proOptions={{ hideAttribution: true }}
        style={{ background: 'var(--accent-bg)' }}
      >
        <Controls
          showInteractive={false}
          style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid var(--border-soft)' }}
        />
      </ReactFlow>
    </div>
  )
}
