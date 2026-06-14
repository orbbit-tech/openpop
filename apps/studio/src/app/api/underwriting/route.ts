import { NextRequest, NextResponse } from 'next/server'

export async function POST(_request?: NextRequest): Promise<NextResponse> {
  return NextResponse.json({ score: 82, approved: true, maxAdvanceUsdc: 40000 })
}
