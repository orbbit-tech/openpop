import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import path from 'node:path'
import type { Proof } from '../../../types/proof'

export async function GET(_request?: NextRequest): Promise<NextResponse> {
  let raw: string
  try {
    raw = await readFile(path.join(process.cwd(), 'proof.json'), 'utf-8')
  } catch {
    // 404, not 500 — absence is expected before the first workflow run.
    return NextResponse.json({ error: 'no proof found' }, { status: 404 })
  }

  let proof: Proof
  try {
    proof = JSON.parse(raw) as Proof
  } catch {
    return NextResponse.json({ error: 'proof.json contains invalid JSON' }, { status: 500 })
  }

  return NextResponse.json(proof)
}
