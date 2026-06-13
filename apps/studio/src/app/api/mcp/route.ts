import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import path from 'node:path'
import type { Receipt } from '../../../types/receipt'

type JsonRpcBody = {
  jsonrpc: string
  method: string
  id?: number | string
  params?: {
    name?: string
    [key: string]: unknown
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = (await request.json()) as JsonRpcBody
  const { method, params } = body

  if (method === 'initialize') {
    return NextResponse.json({
      protocolVersion: '2025-03-26',
      capabilities: { tools: {} },
      serverInfo: { name: 'openpop-mcp', version: '0.1.0' },
    })
  }

  if (method === 'tools/list') {
    return NextResponse.json({
      tools: [
        {
          name: 'get_proof',
          description: 'Read the signed OpenPop receipt from the last CRE simulation run',
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

    let receipt: Receipt
    try {
      receipt = JSON.parse(raw) as Receipt
    } catch {
      return NextResponse.json(
        { error: { code: -32603, message: 'invalid proof JSON' } },
        { status: 500 },
      )
    }

    return NextResponse.json({
      content: [{ type: 'text', text: JSON.stringify(receipt) }],
    })
  }

  return NextResponse.json(
    { error: { code: -32601, message: 'method not found' } },
    { status: 400 },
  )
}
