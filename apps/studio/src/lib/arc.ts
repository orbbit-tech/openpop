import type { Proof } from '@/types/proof'

const ARC_RPC = 'https://rpc.testnet.arc.network'

// keccak256 event topic signatures — verified against Arcscan logs
const RELEASED_SIG = '0x3bfce8de0db7450cc169b94323c210e69a36c6a4a58c9f5d96bec4973adce392'
const REPORT_PROCESSED_SIG = '0x3617b009e9785c42daebadb6d3fb553243a4bf586d07ea72d65d80013ce116b5'

type Zone2 = Pick<
  Proof,
  | 'blockNumber'
  | 'usdcReleasedAmount'
  | 'recipient'
  | 'dealId'
  | 'workflowExecutionId'
  | 'reportId'
  | 'escrowAddress'
  | 'forwarderAddress'
>

export async function fetchArcReceipt(txHash: string): Promise<Partial<Zone2> | null> {
  try {
    const res = await fetch(ARC_RPC, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_getTransactionReceipt',
        params: [txHash],
      }),
    })
    const json = await res.json()
    const receipt = json.result
    if (!receipt) return null

    const zone2: Partial<Zone2> = {
      blockNumber: parseInt(receipt.blockNumber, 16),
    }

    for (const log of receipt.logs as { topics: string[]; data: string; address: string }[]) {
      const sig = log.topics[0]?.toLowerCase()

      if (sig === RELEASED_SIG) {
        // Released(uint256 indexed dealId, address indexed recipient, uint256 amount)
        zone2.dealId = parseInt(log.topics[1], 16)
        zone2.recipient = '0x' + log.topics[2].slice(-40)
        zone2.usdcReleasedAmount = parseInt(log.data, 16)
        zone2.escrowAddress = log.address.toLowerCase()
      }

      if (sig === REPORT_PROCESSED_SIG) {
        // ReportProcessed(address indexed receiver, bytes32 indexed workflowExecutionId, bytes2 indexed reportId, bool result)
        zone2.workflowExecutionId = log.topics[2]
        // bytes2 is right-padded to 32 bytes: 0x0001000...000 → first 6 chars = '0x0001'
        zone2.reportId = log.topics[3].slice(0, 6)
        zone2.forwarderAddress = log.address.toLowerCase()
      }
    }

    return zone2
  } catch {
    return null
  }
}
