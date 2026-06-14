import { NextRequest, NextResponse } from 'next/server'

type UnderwritingResult = { score: number; approved: boolean; maxAdvanceUsdc: number }

const OVERRIDES: Record<string, UnderwritingResult> = {
  'Gallivant Ice Cream':  { score: 82, approved: true,  maxAdvanceUsdc: 40_000 },
  'Alpine Creamery Co.':  { score: 78, approved: true,  maxAdvanceUsdc: 30_000 },
  'Meadow Fresh Dairy':   { score: 91, approved: true,  maxAdvanceUsdc: 65_000 },
  'Summit Valley Farms':  { score: 64, approved: true,  maxAdvanceUsdc: 20_000 },
  'Creston Milk Co.':     { score: 44, approved: false, maxAdvanceUsdc: 0      },
}

const DEFAULT: UnderwritingResult = { score: 82, approved: true, maxAdvanceUsdc: 40_000 }

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json() as { businessName?: string }
    const result = OVERRIDES[body.businessName ?? ''] ?? DEFAULT
    return NextResponse.json(result)
  } catch {
    return NextResponse.json(DEFAULT)
  }
}
