'use client'

import { useState } from 'react'
import { useConnectWithOtp } from '@dynamic-labs/sdk-react-core'

interface Props {
  onSuccess: () => void
}

export function OtpSignIn({ onSuccess }: Props) {
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { connectWithEmail, verifyOneTimePassword } = useConnectWithOtp()

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await connectWithEmail(email)
      setOtpSent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  async function handleOtpSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await verifyOneTimePassword(otp)
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid OTP')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    background: 'var(--surface)',
    border: '1px solid var(--border-soft)',
    color: 'var(--text-1)',
    borderRadius: 6,
    padding: '8px 12px',
    fontSize: 13,
    fontFamily: 'inherit',
    width: '100%',
    boxSizing: 'border-box',
  }

  const labelStyle: React.CSSProperties = {
    fontSize: 11,
    color: 'var(--text-3)',
    marginBottom: 6,
    display: 'block',
  }

  const buttonStyle: React.CSSProperties = {
    background: 'var(--teal)',
    color: '#fff',
    border: 'none',
    borderRadius: 4,
    padding: '8px 16px',
    fontSize: 13,
    fontWeight: 600,
    cursor: loading ? 'not-allowed' : 'pointer',
    fontFamily: 'inherit',
    opacity: loading ? 0.6 : 1,
  }

  if (!otpSent) {
    return (
      <form onSubmit={handleEmailSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div>
          <p style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 16, lineHeight: 1.5 }}>
            Enter your email to sign in. New accounts are created automatically.
          </p>
          <label htmlFor="invest-email" style={labelStyle}>EMAIL</label>
          <input
            id="invest-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            style={inputStyle}
          />
        </div>
        {error && (
          <p style={{ fontSize: 12, color: 'hsl(0, 72%, 51%)', marginTop: 8 }}>{error}</p>
        )}
        <div>
          <button type="submit" disabled={loading} style={buttonStyle}>
            {loading ? 'Sending…' : 'Send OTP'}
          </button>
        </div>
      </form>
    )
  }

  return (
    <form onSubmit={handleOtpSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div>
        <p style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 16, lineHeight: 1.5 }}>
          Check your email for a one-time passcode and enter it below.
        </p>
        <label htmlFor="invest-otp" style={labelStyle}>ONE-TIME PASSCODE</label>
        <input
          id="invest-otp"
          type="text"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          placeholder="Enter OTP"
          required
          style={inputStyle}
        />
      </div>
      {error && (
        <p style={{ fontSize: 12, color: 'hsl(0, 72%, 51%)', marginTop: 8 }}>{error}</p>
      )}
      <div style={{ display: 'flex', gap: 8 }}>
        <button type="submit" disabled={loading} style={buttonStyle}>
          {loading ? 'Verifying…' : 'Verify OTP'}
        </button>
        <button
          type="button"
          onClick={() => { setOtpSent(false); setOtp(''); setError(null) }}
          style={{
            background: 'none',
            border: '1px solid var(--border-soft)',
            color: 'var(--text-3)',
            borderRadius: 4,
            padding: '8px 12px',
            fontSize: 13,
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          Back
        </button>
      </div>
    </form>
  )
}
