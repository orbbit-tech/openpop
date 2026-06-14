export type Proof = {
  companyName: string
  invoiceAmount: string
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
  steps: { label: string; badge?: string; status: 'completed' | 'pending' | 'failed'; metadata?: string }[]
  // Zone 2 — decoded from Arc testnet receipt (hydrated live via fetchArcReceipt)
  usdcReleasedAmount?: number  // raw units (6 decimals): 5000000 = $5 USDC
  recipient?: string           // wallet that received the USDC release
  dealId?: number              // ProofGatedEscrow.Released dealId
  workflowExecutionId?: string // CRE execution ID — ties off-chain run to on-chain event
  reportId?: string            // CRE report ID (e.g. '0x0001')
  escrowAddress?: string       // ProofGatedEscrow contract address
  forwarderAddress?: string    // MockKeystoneForwarder contract address
}
