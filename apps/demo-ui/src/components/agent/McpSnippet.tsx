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
        to fetch and verify this receipt — without trusting the platform operator.
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
      >
        {TOOL_DEF}
      </pre>

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
  )
}
