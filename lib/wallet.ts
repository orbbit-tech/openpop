import { DynamicEvmWalletClient } from '@dynamic-labs-wallet/node-evm';
import { ThresholdSignatureScheme } from '@dynamic-labs-wallet/node';
import type { WalletMetadata } from '@dynamic-labs-wallet/node';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import type { WalletClient } from 'viem';

const STATE_FILE = '.wallet-state.json';

interface WalletState {
  accountAddress: string;
}

/**
 * Returns a viem WalletClient backed by a persistent Dynamic server wallet.
 *
 * On the first call the wallet account is created and its address written to
 * `.wallet-state.json` so every subsequent run reuses the same on-chain identity.
 * Creating a duplicate wallet on each run would fragment funds and invalidate
 * any allowances or nonce sequences already established on-chain.
 *
 * @param chainId - Chain the returned client will sign transactions for
 * @param rpcUrl - RPC endpoint for that chain
 * @returns A viem WalletClient ready to send transactions on the given chain
 */
export async function getViemWalletClient(chainId: number, rpcUrl: string): Promise<WalletClient> {
  const client = new DynamicEvmWalletClient({
    environmentId: process.env.DYNAMIC_ENVIRONMENT_ID!,
  });
  await client.authenticateApiToken(process.env.DYNAMIC_AUTH_TOKEN!);

  let accountAddress: string;
  let walletMetadata: WalletMetadata | undefined;

  /*
   * Reuse the wallet created on the first run so every orchestration run
   * shares the same on-chain identity and nonce sequence.
   */
  if (existsSync(STATE_FILE)) {
    const state: WalletState = JSON.parse(readFileSync(STATE_FILE, 'utf-8') as string);
    accountAddress = state.accountAddress;
  } else {
    /*
     * No prior wallet found — create one, back it up to Dynamic's key
     * management service, and persist the address for future runs.
     */
    const result = await client.createWalletAccount({
      thresholdSignatureScheme: ThresholdSignatureScheme.TWO_OF_TWO,
      password: process.env.DYNAMIC_WALLET_PASSWORD!,
      backUpToDynamic: true,
    });
    walletMetadata = result.walletMetadata;
    accountAddress = walletMetadata.accountAddress;
    writeFileSync(STATE_FILE, JSON.stringify({ accountAddress }));
  }

  /*
   * The SDK requires a full WalletMetadata object even when loading from the
   * state file. Stub the non-address fields — the SDK resolves the real wallet
   * by accountAddress and ignores the stubs during signing.
   */
  const metadata: WalletMetadata = walletMetadata ?? {
    walletId: '',
    accountAddress,
    chainName: 'EVM',
    thresholdSignatureScheme: ThresholdSignatureScheme.TWO_OF_TWO,
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (client.getWalletClient as any)({
    accountAddress,
    walletMetadata: metadata,
    password: process.env.DYNAMIC_WALLET_PASSWORD!,
    chainId,
    rpcUrl,
  }) as unknown as WalletClient;
}
