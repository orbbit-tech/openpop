import type { Proof } from '@/types/proof'

export const MOCK_PROOF: Proof = {
  companyName: 'Gallivant Ice Cream',
  invoiceAmount: '$50,000 · Walmart Net-30',
  compliant: true,
  score: 82,
  approved: true,
  confidence: 91,
  dairyPrice: 2.13,
  txHash: '0x9e704fb066b4c8ed2ed43418a978502a805989d2d01435a883bff03d2bd39623',
  signature: '—',
  timestamp: '2026-06-13T23:21:50.667Z',
  prover: 'CRE / BFT Consensus',
  consensus: { agreed: 7, total: 9 },
  blockNumber: 46946346,
  // Zone 2 — decoded from Arc testnet receipt (live-hydrated on page load via fetchArcReceipt)
  usdcReleasedAmount: 5000000,
  recipient: '0xbc10268a5ca8287bbad5aaf4667c056f35412ea4',
  dealId: 1,
  workflowExecutionId: '0x99b840d91a94ec080e4c76ce95c67eba1c63d26a6c950cba12116d21765beba5',
  reportId: '0x0001',
  escrowAddress: '0x6adeb480bb7b7c54be7fb80b56e7cd23fbd30527',
  forwarderAddress: '0x6e9ee680ef59ef64aa8c7371279c27e496b5edc1',
  steps: [
    {
      label: 'Compliance Check',
      status: 'completed',
      metadata: 'KYC pass · KYB pass · OFAC clear',
    },
    {
      label: 'Dairy Price Oracle',
      status: 'completed',
      metadata: 'USDA cream $2.13/lb · x402 paid',
    },
    {
      label: 'Underwriting Decision',
      status: 'completed',
      metadata: 'Score 82 · Confidence 91% · Approved',
    },
  ],
}
