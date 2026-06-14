import { NextRequest, NextResponse } from 'next/server'

export async function POST(_request?: NextRequest): Promise<NextResponse> {
  return NextResponse.json({ kyc: 'pass', kyb: 'pass', sanctions: 'clear' })
}
