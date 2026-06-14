'use client'

import { useState, useRef, useEffect } from 'react'
import { useConnectWithOtp } from '@dynamic-labs/sdk-react-core'

interface Props {
  onSuccess: () => void
}

export function OtpSignIn({ onSuccess }: Props) {
  const [email, setEmail] = useState('')
  const [digits, setDigits] = useState(['', '', '', '', '', ''])
  const [otpSent, setOtpSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resendCooldown, setResendCooldown] = useState(0)
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const otpRefs = useRef<(HTMLInputElement | null)[]>([])

  const { connectWithEmail, verifyOneTimePassword } = useConnectWithOtp()

  useEffect(() => () => { if (cooldownRef.current) clearInterval(cooldownRef.current) }, [])

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await connectWithEmail(email)
      setOtpSent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send code')
    } finally {
      setLoading(false)
    }
  }

  async function handleOtpSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await verifyOneTimePassword(digits.join(''))
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid code')
    } finally {
      setLoading(false)
    }
  }

  async function handleResend() {
    if (resendCooldown > 0 || loading) return
    setLoading(true)
    try {
      await connectWithEmail(email)
      setResendCooldown(60)
      cooldownRef.current = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) { if (cooldownRef.current) clearInterval(cooldownRef.current); return 0 }
          return prev - 1
        })
      }, 1000)
    } catch (_err) {
      // silent — user can try again
    } finally {
      setLoading(false)
    }
  }

  function handleDigitChange(index: number, value: string) {
    const digit = value.replace(/\D/g, '').slice(-1)
    const next = [...digits]
    next[index] = digit
    setDigits(next)
    if (digit && index < 5) otpRefs.current[index + 1]?.focus()
  }

  function handleDigitKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !digits[index] && index > 0) otpRefs.current[index - 1]?.focus()
    if (e.key === 'ArrowLeft' && index > 0) otpRefs.current[index - 1]?.focus()
    if (e.key === 'ArrowRight' && index < 5) otpRefs.current[index + 1]?.focus()
  }

  function handleDigitPaste(e: React.ClipboardEvent) {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    const next = [...digits]
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i]
    setDigits(next)
    otpRefs.current[Math.min(pasted.length, 5)]?.focus()
  }

  const inputCls: React.CSSProperties = {
    background: '#fff',
    border: '1px solid #e2e8f0',
    color: '#0f172a',
    borderRadius: 8,
    padding: '0 12px',
    height: 40,
    fontSize: 14,
    fontFamily: 'inherit',
    width: '100%',
    boxSizing: 'border-box',
    outline: 'none',
    transition: 'border-color 0.15s, box-shadow 0.15s',
  }

  const primaryBtn: React.CSSProperties = {
    background: 'hsl(180, 85%, 32%)',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    height: 40,
    fontSize: 14,
    fontWeight: 600,
    cursor: loading ? 'not-allowed' : 'pointer',
    fontFamily: 'inherit',
    opacity: loading ? 0.6 : 1,
    width: '100%',
    transition: 'opacity 0.15s',
  }

  if (!otpSent) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {/* Heading */}
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ fontSize: 22, fontWeight: 600, color: '#0f172a', margin: '0 0 6px', letterSpacing: '-0.025em' }}>
            Log in or sign up
          </h1>
          <p style={{ fontSize: 14, color: '#64748b', margin: 0 }}>
            Enter your email to continue
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleEmailSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="investor@company.com"
            required
            style={inputCls}
            onFocus={(e) => { e.currentTarget.style.borderColor = 'hsl(180, 85%, 42%)'; e.currentTarget.style.boxShadow = '0 0 0 3px hsl(180,75%,42%,0.12)' }}
            onBlur={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = 'none' }}
          />
          {error && <p style={{ fontSize: 12, color: '#ef4444', margin: 0 }}>{error}</p>}
          <button type="submit" disabled={loading} style={primaryBtn}>
            {loading ? 'Sending…' : 'Continue'}
          </button>
        </form>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>

      {/* Heading */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, color: '#0f172a', margin: '0 0 6px', letterSpacing: '-0.025em' }}>
          Enter the 6-digit code
        </h1>
        <p style={{ fontSize: 14, color: '#64748b', margin: 0 }}>
          We sent a code to <span style={{ color: '#1e293b', fontWeight: 500 }}>{email}</span>
        </p>
      </div>

      {/* OTP form */}
      <form onSubmit={handleOtpSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* 6-slot OTP */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
          {digits.map((digit, i) => (
            <input
              key={i}
              ref={(el) => { otpRefs.current[i] = el }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleDigitChange(i, e.target.value)}
              onKeyDown={(e) => handleDigitKeyDown(i, e)}
              onPaste={i === 0 ? handleDigitPaste : undefined}
              autoFocus={i === 0}
              style={{
                width: 44,
                height: 52,
                textAlign: 'center',
                fontSize: 20,
                fontWeight: 600,
                fontFamily: 'inherit',
                color: '#0f172a',
                background: '#fff',
                border: '1px solid #e2e8f0',
                borderRadius: 8,
                outline: 'none',
                transition: 'border-color 0.15s, box-shadow 0.15s',
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = 'hsl(180, 85%, 42%)'; e.currentTarget.style.boxShadow = '0 0 0 3px hsl(180,75%,42%,0.12)' }}
              onBlur={(e) => { e.currentTarget.style.borderColor = digit ? '#94a3b8' : '#e2e8f0'; e.currentTarget.style.boxShadow = 'none' }}
            />
          ))}
        </div>

        {error && <p style={{ fontSize: 12, color: '#ef4444', margin: 0, textAlign: 'center' }}>{error}</p>}

        <button type="submit" disabled={loading || digits.join('').length < 6} style={primaryBtn}>
          {loading ? 'Verifying…' : 'Continue'}
        </button>

        {/* Resend + hint */}
        <div style={{ textAlign: 'center' }}>
          <button
            type="button"
            onClick={handleResend}
            disabled={resendCooldown > 0 || loading}
            style={{
              background: 'none',
              border: 'none',
              fontSize: 13,
              color: resendCooldown > 0 ? '#94a3b8' : '#64748b',
              cursor: resendCooldown > 0 || loading ? 'default' : 'pointer',
              textDecoration: resendCooldown > 0 ? 'none' : 'underline',
              fontFamily: 'inherit',
              padding: 0,
            }}
          >
            {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : "Didn't receive a code? Resend"}
          </button>
          <p style={{ fontSize: 12, color: '#94a3b8', margin: '6px 0 0' }}>
            Check your spam folder if you don&apos;t see the email.
          </p>
        </div>
      </form>
    </div>
  )
}
