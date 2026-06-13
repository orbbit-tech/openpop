export type Receipt = {
  compliant: boolean
  score: number
  approved: boolean
  confidence: number
  dairyPrice: number
  txHash: string
  signature: string
  timestamp: string
  prover: string
  consensus: { agreed: number; total: number }
  blockNumber: number
  steps: { label: string; status: 'completed' | 'pending' | 'failed'; metadata?: string }[]
}
