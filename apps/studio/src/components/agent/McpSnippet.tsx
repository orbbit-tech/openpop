'use client'

import { useState } from 'react'

const TOOL_DEF = `{
  "name": "get_proof",
  "description": "Fetch the signed CRE receipt for a workflow run. Any agent can verify the signature independently — no trust in the platform operator required.",
  "inputSchema": {
    "type": "object",
    "properties": {
      "workflow_id": {
        "type": "string",
        "description": "The workflow run ID (e.g. \\"gallivant-001\\")"
      }
    },
    "required": ["workflow_id"]
  }
}`

const INSTALL = `npx openpop-mcp@latest`

function highlight(json: string): string {
  return json
    .replace(/("(?:[^"\\]|\\.)*")(\s*:)/g, '<span style="color:hsl(180,85%,50%)">$1</span>$2')
    .replace(/:\s*("(?:[^"\\]|\\.)*")/g, ': <span style="color:hsl(142,71%,52%)">$1</span>')
    .replace(/:\s*(\d+\.?\d*)/g, ': <span style="color:hsl(38,92%,55%)">$1</span>')
    .replace(/:\s*(true|false|null)/g, ': <span style="color:hsl(217,91%,68%)">$1</span>')
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  function copy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }

  return (
    <button
      onClick={copy}
      title="Copy"
      style={{
        position: 'absolute',
        top: 8,
        right: 8,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 24,
        height: 24,
        background: copied ? 'hsl(180, 85%, 8%)' : 'hsl(215, 14%, 17%)',
        border: copied ? '1px solid hsl(180, 85%, 30%)' : '1px solid hsl(215, 14%, 28%)',
        borderRadius: 4,
        cursor: 'pointer',
        color: copied ? 'hsl(180, 85%, 50%)' : 'hsl(215, 14%, 55%)',
        transition: 'color .15s, background .15s, border-color .15s',
        padding: 0,
      }}
    >
      {copied ? (
        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="2,8 6,12 14,4" />
        </svg>
      ) : (
        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="5" y="5" width="9" height="9" rx="1" />
          <path d="M11 5V3a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h2" />
        </svg>
      )}
    </button>
  )
}

export function McpSnippet() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 8 }}>
      <div
        style={{
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: '0.12em',
          textTransform: 'uppercase' as const,
          color: 'hsl(215, 14%, 47%)',
        }}
      >
        MCP Server
      </div>

      <p
        style={{
          fontSize: 11,
          color: 'hsl(215, 16%, 55%)',
          lineHeight: 1.65,
          margin: 0,
        }}
      >
        Any agent can call{' '}
        <code
          style={{
            fontFamily: 'monospace',
            fontSize: 10,
            background: 'hsl(215, 14%, 16%)',
            color: 'hsl(180, 85%, 50%)',
            padding: '1px 5px',
            borderRadius: 3,
          }}
        >
          get_proof
        </code>{' '}
        to fetch and verify this proof — without trusting the platform operator.
      </p>

      <div
        style={{
          fontSize: 9,
          fontWeight: 600,
          letterSpacing: '0.08em',
          textTransform: 'uppercase' as const,
          color: 'hsl(215, 14%, 40%)',
          marginTop: 4,
        }}
      >
        Tool definition
      </div>
      <div style={{ position: 'relative' }}>
        <CopyButton text={TOOL_DEF} />
        <pre
          style={{
            background: 'hsl(215, 14%, 11%)',
            border: '1px solid hsl(215, 14%, 22%)',
            borderRadius: 8,
            padding: '12px 14px',
            fontFamily: 'monospace',
            fontSize: 9.5,
            lineHeight: 1.6,
            color: 'hsl(215, 16%, 75%)',
            overflowX: 'auto',
            whiteSpace: 'pre',
            margin: 0,
          }}
          dangerouslySetInnerHTML={{ __html: highlight(TOOL_DEF) }}
        />
      </div>

      <div
        style={{
          fontSize: 9,
          fontWeight: 600,
          letterSpacing: '0.08em',
          textTransform: 'uppercase' as const,
          color: 'hsl(215, 14%, 40%)',
          marginTop: 12,
        }}
      >
        One-liner install
      </div>
      <div style={{ position: 'relative' }}>
        <CopyButton text={INSTALL} />
        <pre
          style={{
            background: 'hsl(180, 85%, 4%)',
            border: '1px solid hsl(180, 85%, 39%, 0.25)',
            borderRadius: 8,
            padding: '12px 14px',
            fontFamily: 'monospace',
            fontSize: 10,
            lineHeight: 1.6,
            color: 'hsl(180, 85%, 50%)',
            overflowX: 'auto',
            whiteSpace: 'pre',
            margin: 0,
          }}
        >
          {INSTALL}
        </pre>
      </div>
    </div>
  )
}
