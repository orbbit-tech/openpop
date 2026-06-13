import { execSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { wrapFetchWithPayment } from 'x402-fetch';
import { getViemWalletClient } from '../lib/wallet.js';

const PROOF_ESCROW_ABI = [
  {
    name: 'submitProof',
    type: 'function' as const,
    inputs: [
      { name: 'compliant', type: 'bool' },
      { name: 'score', type: 'uint256' },
      { name: 'sig', type: 'bytes' },
    ],
    outputs: [] as const,
  },
] as const;

async function main(): Promise<void> {
  const chainId = Number(process.env.ARC_CHAIN_ID);
  const rpcUrl = process.env.ARC_RPC_URL!;
  const dairyApiUrl = process.env.DAIRY_API_URL!;
  const escrowAddress = process.env.PROOF_GATED_ESCROW_ADDRESS! as `0x${string}`;

  const walletClient = await getViemWalletClient(chainId, rpcUrl);
  const walletAddress = walletClient.account!.address;

  // x402-fetch requires a SignerWallet (account non-undefined).
  // Dynamic's getWalletClient returns WalletClient<Transport, Chain, Account> — account is always set.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fetchWithPayment = wrapFetchWithPayment(fetch, walletClient as any);
  const dairyRes = await fetchWithPayment(dairyApiUrl);
  const dairyPrice = await dairyRes.json() as { price: number; unit: string };

  const stdout = execSync('cre workflow simulate --broadcast', { encoding: 'utf-8' });
  const creReceipt = JSON.parse(stdout) as { compliant: boolean; score: number; sig: string };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const arcTxHash = await (walletClient as any).writeContract({
    address: escrowAddress,
    abi: PROOF_ESCROW_ABI,
    functionName: 'submitProof',
    args: [creReceipt.compliant, BigInt(creReceipt.score), '0x' as `0x${string}`],
    chain: null,
  });

  writeFileSync(
    'receipt.json',
    JSON.stringify({ dairyPrice, creReceipt, arcTxHash, walletAddress }, null, 2)
  );

  console.log('Receipt written. Arc tx:', arcTxHash);
}

main().catch((err: Error) => {
  console.error(err);
  process.exit(1);
});
