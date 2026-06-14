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

function ok(id: number | string | undefined, result: unknown): NextResponse {
  return NextResponse.json({ jsonrpc: '2.0', id: id ?? null, result })
}

function err(id: number | string | undefined, code: number, message: string): NextResponse {
  return NextResponse.json({ jsonrpc: '2.0', id: id ?? null, error: { code, message } })
}

export async function GET(): Promise<NextResponse> {
  return NextResponse.json({ status: 'ok', server: 'openpop-mcp', version: '0.1.0' })
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = (await request.json()) as JsonRpcBody
  const { method, id, params } = body

  if (method === 'initialize') {
    return ok(id, {
      protocolVersion: '2024-11-05',
      capabilities: { tools: {} },
      serverInfo: { name: 'openpop-mcp', version: '0.1.0' },
    })
  }

  if (method === 'notifications/initialized') {
    return new NextResponse(null, { status: 204 })
  }

  if (method === 'tools/list') {
    return ok(id, {
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
      return err(id, -32601, 'method not found')
    }

    let raw: string
    try {
      raw = await readFile(path.join(process.cwd(), 'proof.json'), 'utf-8')
    } catch {
      return err(id, -32603, 'proof not found')
    }

    let proof: Proof
    try {
      proof = JSON.parse(raw) as Proof
    } catch {
      return err(id, -32603, 'invalid proof JSON')
    }

    return ok(id, {
      content: [{ type: 'text', text: JSON.stringify(proof) }],
    })
  }

  return err(id, -32601, 'method not found')
}
