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
  blockNumber: 47005738,
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
