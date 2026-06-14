'use client'

import { memo, useMemo } from 'react'
import { ReactFlow, Controls, Handle, Position, type Node, type Edge, type NodeTypes, type NodeProps } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { ProofNode } from './ProofNode'
import type { Proof } from '@/types/proof'

// Zone boundary node — renders as a visual bridge between CRE TEE and Arc Testnet
function ZoneBoundaryNodeComponent({ data }: NodeProps) {
  const d = data as { consensus: string; txShort: string }
  return (
    <div style={{ width: 340, position: 'relative' }}>
      <Handle type="target" position={Position.Top} style={{ opacity: 0, pointerEvents: 'none' }} />
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 14px',
          background: 'linear-gradient(90deg, hsl(180, 60%, 97%) 0%, hsl(240, 60%, 97%) 100%)',
          border: '1px dashed hsl(220, 30%, 80%)',
          borderRadius: 8,
          gap: 12,
        }}
      >
        {/* Left: CRE consensus summary */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div
            style={{
              width: 16,
              height: 16,
              borderRadius: '50%',
              background: 'var(--teal)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <svg width="9" height="9" viewBox="0 0 16 16" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="2,8 6,12 14,4" />
            </svg>
          </div>
          <span style={{ fontSize: 9, fontWeight: 600, color: 'hsl(180, 50%, 32%)', letterSpacing: '0.03em' }}>
            {d.consensus} · report signed
          </span>
        </div>

        {/* Arrow */}
        <svg width="18" height="10" viewBox="0 0 18 10" fill="none" style={{ flexShrink: 0 }}>
          <line x1="0" y1="5" x2="13" y2="5" stroke="hsl(220, 30%, 72%)" strokeWidth="1.5" />
          <polyline points="10,2 13,5 10,8" stroke="hsl(220, 30%, 72%)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>

        {/* Right: Arc Testnet label */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
          <div
            style={{
              padding: '2px 7px',
              borderRadius: 100,
              background: 'hsl(240, 60%, 97%)',
              border: '1px solid hsl(240, 60%, 82%)',
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase' as const,
              color: 'hsl(240, 60%, 44%)',
            }}
          >
            Arc Testnet
          </div>
          <span style={{ fontSize: 9, color: 'hsl(240, 40%, 58%)', fontFamily: 'monospace' }}>
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
  zoneBoundary: ZoneBoundaryNode,
}

interface Props {
  proof: Proof
}

export function WorkflowCanvas({ proof }: Props) {
  const txShort = proof.txHash.startsWith('0x')
    ? `${proof.txHash.slice(0, 8)}…${proof.txHash.slice(-4)}`
    : proof.txHash

  const usdcAmount = proof.usdcReleasedAmount
    ? `${(proof.usdcReleasedAmount / 1_000_000).toFixed(0)} USDC`
    : 'USDC'

  const recipientShort = proof.recipient
    ? `${proof.recipient.slice(0, 6)}…${proof.recipient.slice(-4)}`
    : '—'

  const nodes: Node[] = useMemo(() => {
    const zoneY = 110 * (proof.steps.length + 1) + 20 // extra gap before zone boundary
    const zone2Start = zoneY + 100

    return [
      // — Zone 1: CRE TEE —
      {
        id: 'trigger',
        type: 'proofNode',
        position: { x: 0, y: 0 },
        data: {
          label: 'Invoice Submitted',
          meta: `${proof.companyName} · ${proof.invoiceAmount}`,
          badge: 'Trigger',
          status: 'completed',
        },
      },
      ...proof.steps.map((step, i) => ({
        id: `step-${i}`,
        type: 'proofNode',
        position: { x: 0, y: 110 * (i + 1) },
        data: {
          label: step.label,
          meta: step.metadata,
          badge: step.status === 'completed' ? 'Attested' : step.status === 'failed' ? 'Failed' : 'Pending',
          status: step.status,
        },
      })),

      // — Zone boundary —
      {
        id: 'zone-boundary',
        type: 'zoneBoundary',
        position: { x: -40, y: zoneY },
        data: {
          consensus: `${proof.consensus.agreed}/${proof.consensus.total} nodes`,
          txShort,
        },
      },

      // — Zone 2: Arc Testnet (single tx, two events) —
      {
        id: 'sig-verified',
        type: 'proofNode',
        position: { x: 0, y: zone2Start },
        data: {
          label: 'Signature Verified',
          meta: `MockKeystoneForwarder · BFT report accepted`,
          badge: 'On-Chain',
          status: 'on-chain',
        },
      },
      {
        id: 'usdc-released',
        type: 'proofNode',
        position: { x: 0, y: zone2Start + 110 },
        data: {
          label: 'USDC Released',
          meta: `${usdcAmount} → ${recipientShort} · ProofGatedEscrow`,
          badge: 'Released',
          status: 'released',
        },
      },
    ]
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proof, txShort, usdcAmount, recipientShort])

  const edges: Edge[] = useMemo(() => {
    const tealEdge = { stroke: 'hsl(180, 40%, 78%)', strokeWidth: 1.5 }
    const indigoEdge = { stroke: 'hsl(240, 40%, 78%)', strokeWidth: 1.5 }

    const zone1Ids = ['trigger', ...proof.steps.map((_, i) => `step-${i}`)]
    const zone1Edges: Edge[] = zone1Ids.slice(0, -1).map((id, i) => ({
      id: `e-z1-${i}`,
      source: id,
      target: zone1Ids[i + 1],
      type: 'smoothstep',
      style: tealEdge,
    }))

    // Cross-zone edges (dashed)
    const crossEdges: Edge[] = [
      {
        id: 'e-cross-1',
        source: zone1Ids[zone1Ids.length - 1],
        target: 'zone-boundary',
        type: 'smoothstep',
        style: { ...tealEdge, strokeDasharray: '4 3' },
      },
      {
        id: 'e-cross-2',
        source: 'zone-boundary',
        target: 'sig-verified',
        type: 'smoothstep',
        style: { ...indigoEdge, strokeDasharray: '4 3' },
      },
    ]

    // Zone 2 edge
    const zone2Edges: Edge[] = [
      {
        id: 'e-z2-0',
        source: 'sig-verified',
        target: 'usdc-released',
        type: 'smoothstep',
        style: indigoEdge,
      },
    ]

    return [...zone1Edges, ...crossEdges, ...zone2Edges]
  }, [proof])

  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border-soft)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        height: 820,
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
        fitViewOptions={{ padding: 0.18, maxZoom: 1.1 }}
        proOptions={{ hideAttribution: true }}
        style={{ background: 'var(--accent-bg)' }}
      >
        <Controls
          showInteractive={false}
          style={{
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            border: '1px solid var(--border-soft)',
          }}
        />
      </ReactFlow>
    </div>
  )
}
