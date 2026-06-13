'use client'

import { useMemo } from 'react'
import { ReactFlow, Controls, type Node, type Edge, type NodeTypes } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { ProofNode } from './ProofNode'
import type { Proof } from '@/types/proof'

const nodeTypes: NodeTypes = { proofNode: ProofNode }

interface Props {
  proof: Proof
}

export function WorkflowCanvas({ proof }: Props) {
  const nodes: Node[] = useMemo(() => {
    const baseNodes: Node[] = [
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
    ]

    const stepNodes: Node[] = proof.steps.map((step, i) => ({
      id: `step-${i}`,
      type: 'proofNode',
      position: { x: 0, y: 110 * (i + 1) },
      data: {
        label: step.label,
        meta: step.metadata,
        badge: step.status === 'completed' ? 'Verified' : step.status === 'failed' ? 'Failed' : 'Pending',
        status: step.status,
      },
    }))

    const decisionNode: Node = {
      id: 'decision',
      type: 'proofNode',
      position: { x: 0, y: 110 * (proof.steps.length + 1) },
      data: {
        label: 'Decision Recorded',
        meta: `Arc Testnet · Block ${proof.blockNumber.toLocaleString()} · ${proof.txHash.slice(0, 6)}…${proof.txHash.slice(-4)}`,
        badge: 'Confirmed',
        status: 'completed',
      },
    }

    return [...baseNodes, ...stepNodes, decisionNode]
  }, [proof])

  const edges: Edge[] = useMemo(() => {
    const allIds = ['trigger', ...proof.steps.map((_, i) => `step-${i}`), 'decision']
    return allIds.slice(0, -1).map((id, i) => ({
      id: `e${i}`,
      source: id,
      target: allIds[i + 1],
      type: 'smoothstep',
      style: { stroke: 'hsl(214, 32%, 82%)', strokeWidth: 1.5 },
    }))
  }, [proof])

  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border-soft)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        height: 540,
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
        fitViewOptions={{ padding: 0.2, maxZoom: 1.2 }}
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
