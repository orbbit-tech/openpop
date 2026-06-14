import { describe, it, expect } from 'vitest'
import { NextRequest } from 'next/server'

const { POST } = await import('../../../src/app/api/underwriting/route')

function makeRequest(): NextRequest {
  return new NextRequest('http://localhost/api/underwriting', { method: 'POST' })
}

describe('POST /api/underwriting', () => {
  it('returns 200 with score, approved, and maxAdvanceUsdc fields at expected values', async () => {
    const res = await POST(makeRequest())
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.score).toBe(82)
    expect(body.approved).toBe(true)
    expect(body.maxAdvanceUsdc).toBe(40000)
  })
})
