import type { Receipt } from '@/types/receipt'

interface Props {
  receipt: Receipt
}

function highlight(json: string): string {
  return json
    .replace(/("(?:[^"\\]|\\.)*")(\s*:)/g, '<span style="color:hsl(180,85%,50%)">$1</span>$2')
    .replace(/:\s*("(?:[^"\\]|\\.)*")/g, ': <span style="color:hsl(142,71%,52%)">$1</span>')
    .replace(/:\s*(\d+\.?\d*)/g, ': <span style="color:hsl(38,92%,55%)">$1</span>')
    .replace(/:\s*(true|false|null)/g, ': <span style="color:hsl(217,91%,68%)">$1</span>')
}

export function RawReceipt({ receipt }: Props) {
  const json = JSON.stringify(receipt, null, 2)

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
        Raw JSON Receipt
      </div>
      <pre
        style={{
          background: 'hsl(215, 14%, 11%)',
          border: '1px solid hsl(215, 14%, 22%)',
          borderRadius: 8,
          padding: '12px 14px',
          fontFamily: 'monospace',
          fontSize: 10,
          lineHeight: 1.6,
          color: 'hsl(215, 16%, 75%)',
          overflowX: 'auto',
          whiteSpace: 'pre',
          margin: 0,
        }}
        dangerouslySetInnerHTML={{ __html: highlight(json) }}
      />
    </div>
  )
}
