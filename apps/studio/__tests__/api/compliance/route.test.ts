import { describe, it, expect } from 'vitest'
import { NextRequest } from 'next/server'

const { POST } = await import('../../../src/app/api/compliance/route')

function makeRequest(): NextRequest {
  return new NextRequest('http://localhost/api/compliance', { method: 'POST' })
}

describe('POST /api/compliance', () => {
  it('returns 200 with kyc, kyb, and sanctions fields set to passing values', async () => {
    const res = await POST(makeRequest())
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.kyc).toBe('pass')
    expect(body.kyb).toBe('pass')
    expect(body.sanctions).toBe('clear')
  })
})
