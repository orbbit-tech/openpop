import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import path from 'node:path'
import type { Proof } from '../../../../types/proof'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ dealId: string }> },
): Promise<NextResponse> {
  const { dealId } = await params
  const file = path.join(process.cwd(), 'proofs', `${dealId}.json`)

  let raw: string
  try {
    raw = await readFile(file, 'utf-8')
  } catch {
    return NextResponse.json({ error: 'proof not found' }, { status: 404 })
  }

  try {
    return NextResponse.json(JSON.parse(raw) as Proof)
  } catch {
    return NextResponse.json({ error: 'invalid proof JSON' }, { status: 500 })
  }
}
