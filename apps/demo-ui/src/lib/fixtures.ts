import type { Receipt } from '@/types/receipt'

export const MOCK_RECEIPT: Receipt = {
  companyName: 'Gallivant Ice Cream',
  invoiceAmount: '$50,000 · Walmart Net-30',
  compliant: true,
  score: 82,
  approved: true,
  confidence: 91,
  dairyPrice: 2.34,
  txHash: '0x8d2fa1c9e3b47f2d6a1c5e8b2d4f7a3c6b9e1a4c7d2f5a8c1b3e6a9c4d7f2b5e8a1c3b6',
  signature:
    '0x1b4a9e2c7f3d8b5a6c1e4f7a2d9b6c3e8a5f1d4c7b2e9a6c3f8d5b2e7a4c1f6d3b8e5a2c9f4d1b6e3a8c5f2d7b4e1a9c6f3d8b5e2a7c4f1d6b3e8a5c2f9d4b7e2a1c8f5d3b6e9a4c7f2d5b8e3a6c1f4d9b2e7a5c8f3d6b1e4a9c2f7d4b5e8a3c6f1d2b9e6a4c3f8d7b2e5a1c4f9d6b3e8a7c2f5d1b4e3a8c6f2d9b7e4a5c1f8d3b6e2a9c4f7d5b1e6a3c8f2d4b9e7a2c5f1d8b3e6a4c7f9d2b5e1a6c3f8d7b4e9a2c5f6d1b8e3a7c4f2d9b6e5a1c8f3d4b7e2a9c6f1d5b3e8a4c7f2d6b9e1a3c5f8d2b4e7a6c3f9d1b5e4a8c2f7d6b3e9a5c1f4d8b2e6a3c7f5d9b1e4a6c2f8d3b7e5a9c4f1d6b2e8a7c3f5d4b9e1a6c8f2d3b7e5a4c9f1d6b8e2a5c3f7d4b1e9a6c2f8d5b3e7a4c1f9d2b6e8a3c5f7d4b9e2a1c6f3d8b5e7a4c2f9d6b1e3a8c5f4d7b2e9a6c3f1d5b8e4a7c2f6d9b3e1a5c8f4d2b7e6a3c9f5d1b4e8a2c7f3d6b9e5a4c1f8d2b3e7a6c4f9d5b1e2a8c6f3d7b4e9a5c2f1d6b8e3a7c4f5d2b9e6a1c3f8d4b7e5a2c6f9d1b3e8a4c7f2d5b6e1a9c3f4d8b2e7a5c1f6d3b9e4a2c8f5d7b1e6a3c2f9d4b8e5a7c1f3d6b2e9a4c5f8d7b3e1a6c4f2d9b5e8a3c7f1d4b6e2a9c3f5d8b7e4a1c6f2d3b9e5a8c4f7d1b2e6a3c9f5d4b7e8a1c2f6d3b9e4a5c1f8d7b2e6a3c4f9d5b1e2a8c7f3d6b4e9a5c2f1d8b3e7a4c6f2d9b5e1a3c8f4d7b2e6a9c3f5d1b4e8a7c2f6d3b9e5a1c4f8d2b7e6a3c9f4d5b1e8a2c7f3d6b4e9a5c1f2d8b3e7a6c4f9d5b2e1a3c8f6d4b7e9a2c5f1d3b6e8a4c7f2d5b9e3a1c6f8d4b2e7a5c3f9d1b6e4a8c2f7d3b5e9a1c6f4d8b2e3a7c5f9d6b1e4a2c8f3d7b5e9a6c1f2d4b8e3a7c5f6d9b1e2a4c8f3d7b5e9a6c2f1d4b8e3a7c5f6d9b1e4a2c8f3d5b7e9a6c1f2d4b8e3a7c5f9d6b1e2a4c',
  timestamp: '2026-06-13T14:32:00Z',
  prover: 'CRE / BFT Consensus',
  consensus: { agreed: 7, total: 9 },
  blockNumber: 9910,
  steps: [
    {
      label: 'Compliance Check',
      status: 'completed',
      metadata: 'KYC pass · KYB pass · OFAC clean',
    },
    {
      label: 'Dairy Price Oracle',
      status: 'completed',
      metadata: 'USDA cream $2.34/lb · x402 paid · Block 9,908',
    },
    {
      label: 'Underwriting Decision',
      status: 'completed',
      metadata: 'Score 82 · Confidence 91% · Approved',
    },
  ],
}
