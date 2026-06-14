import { DynamicEvmWalletClient } from '@dynamic-labs-wallet/node-evm';
import { ThresholdSignatureScheme } from '@dynamic-labs-wallet/node';
import { existsSync, writeFileSync } from 'node:fs';

const STATE_FILE = '.wallet-state.json';

if (existsSync(STATE_FILE)) {
  const { accountAddress } = JSON.parse(
    (await import('node:fs')).readFileSync(STATE_FILE, 'utf-8') as string,
  );
  console.log('Wallet already exists:', accountAddress);
  console.log('Delete .wallet-state.json to create a new one.');
  process.exit(0);
}

const client = new DynamicEvmWalletClient({
  environmentId: process.env.DYNAMIC_ENVIRONMENT_ID!,
});
await client.authenticateApiToken(process.env.DYNAMIC_AUTH_TOKEN!);

console.log('Creating server wallet via Dynamic MPC...');

const { walletMetadata } = await client.createWalletAccount({
  thresholdSignatureScheme: ThresholdSignatureScheme.TWO_OF_TWO,
  password: process.env.DYNAMIC_WALLET_PASSWORD!,
  backUpToDynamic: true,
  onError: (err: Error) => {
    console.error('Wallet creation failed:', err.message);
    process.exit(1);
  },
});

const { accountAddress } = walletMetadata;
writeFileSync(STATE_FILE, JSON.stringify({ accountAddress }, null, 2));

console.log('');
console.log('Server wallet created.');
console.log('Address:', accountAddress);
console.log('State saved to .wallet-state.json');
console.log('');
console.log('Next: fund this address with USDC on Arc testnet, then run npm start.');
