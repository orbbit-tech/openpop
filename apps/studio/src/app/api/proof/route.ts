import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import path from 'node:path'
import type { Receipt } from '../../../types/receipt'

export async function GET(_request?: NextRequest): Promise<NextResponse> {
  let raw: string
  try {
    raw = await readFile(path.join(process.cwd(), 'proof.json'), 'utf-8')
  } catch {
    return NextResponse.json({ error: 'no proof found' }, { status: 404 })
  }

  let receipt: Receipt
  try {
    receipt = JSON.parse(raw) as Receipt
  } catch {
    return NextResponse.json({ error: 'proof.json contains invalid JSON' }, { status: 500 })
  }

  return NextResponse.json(receipt)
}
