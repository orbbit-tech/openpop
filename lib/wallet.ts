import { DynamicEvmWalletClient } from '@dynamic-labs-wallet/node-evm';
import { ThresholdSignatureScheme } from '@dynamic-labs-wallet/node';
import type { WalletMetadata } from '@dynamic-labs-wallet/node';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import type { WalletClient } from 'viem';

const STATE_FILE = '.wallet-state.json';

interface WalletState {
  accountAddress: string;
}

export async function getViemWalletClient(chainId: number, rpcUrl: string): Promise<WalletClient> {
  const client = new DynamicEvmWalletClient({
    environmentId: process.env.DYNAMIC_ENVIRONMENT_ID!,
  });
  await client.authenticateApiToken(process.env.DYNAMIC_AUTH_TOKEN!);

  let accountAddress: string;
  let walletMetadata: WalletMetadata | undefined;

  if (existsSync(STATE_FILE)) {
    const state: WalletState = JSON.parse(readFileSync(STATE_FILE, 'utf-8') as string);
    accountAddress = state.accountAddress;
  } else {
    const result = await client.createWalletAccount({
      thresholdSignatureScheme: ThresholdSignatureScheme.TWO_OF_TWO,
      password: process.env.DYNAMIC_WALLET_PASSWORD!,
      backUpToDynamic: true,
    });
    walletMetadata = result.walletMetadata;
    accountAddress = walletMetadata.accountAddress;
    writeFileSync(STATE_FILE, JSON.stringify({ accountAddress }));
  }

  // Build a minimal walletMetadata when loading from state.
  // The SDK uses accountAddress as the primary lookup key.
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
