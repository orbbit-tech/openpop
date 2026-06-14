import { NextRequest, NextResponse } from 'next/server'

type ComplianceResult = { kyc: 'pass' | 'fail'; kyb: 'pass' | 'fail'; sanctions: 'clear' | 'flagged' }

const OVERRIDES: Record<string, ComplianceResult> = {
  'Creston Milk Co.': { kyc: 'pass', kyb: 'fail', sanctions: 'clear' },
}

const DEFAULT: ComplianceResult = { kyc: 'pass', kyb: 'pass', sanctions: 'clear' }

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json() as { businessName?: string }
    const result = OVERRIDES[body.businessName ?? ''] ?? DEFAULT
    return NextResponse.json(result)
  } catch {
    return NextResponse.json(DEFAULT)
  }
}
