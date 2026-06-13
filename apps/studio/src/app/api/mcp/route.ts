import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import path from 'node:path'
import type { Proof } from '../../../types/proof'

type JsonRpcBody = {
  jsonrpc: string
  method: string
  id?: number | string
  params?: {
    name?: string
    [key: string]: unknown
  }
}

/**
 * Stateless MCP Streamable HTTP endpoint (protocol 2025-03-26).
 * Each POST is a self-contained JSON-RPC exchange — no session or streaming needed
 * because get_proof is a single read with no side effects.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = (await request.json()) as JsonRpcBody
  const { method, params } = body

  // MCP handshake — callers send this first to confirm the protocol version.
  if (method === 'initialize') {
    return NextResponse.json({
      protocolVersion: '2025-03-26',
      capabilities: { tools: {} },
      serverInfo: { name: 'openpop-mcp', version: '0.1.0' },
    })
  }

  // Capability discovery — advertise the one tool this server exposes.
  if (method === 'tools/list') {
    return NextResponse.json({
      tools: [
        {
          name: 'get_proof',
          description: 'Read the signed OpenPop proof from the last CRE simulation run',
          inputSchema: { type: 'object', properties: {} },
        },
      ],
    })
  }

  if (method === 'tools/call') {
    if (params?.name !== 'get_proof') {
      return NextResponse.json(
        { error: { code: -32601, message: 'method not found' } },
        { status: 400 },
      )
    }

    let raw: string
    try {
      raw = await readFile(path.join(process.cwd(), 'proof.json'), 'utf-8')
    } catch {
      return NextResponse.json(
        { error: { code: -32603, message: 'proof not found' } },
        { status: 500 },
      )
    }

    let proof: Proof
    try {
      proof = JSON.parse(raw) as Proof
    } catch {
      return NextResponse.json(
        { error: { code: -32603, message: 'invalid proof JSON' } },
        { status: 500 },
      )
    }

    // MCP tool results are always a content array — text block is the standard shape
    // for a tool that returns a structured payload as a string.
    return NextResponse.json({
      content: [{ type: 'text', text: JSON.stringify(proof) }],
    })
  }

  return NextResponse.json(
    { error: { code: -32601, message: 'method not found' } },
    { status: 400 },
  )
}
