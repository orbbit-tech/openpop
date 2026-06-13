import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('node:fs', () => ({
  existsSync: vi.fn(),
  readFileSync: vi.fn(),
  writeFileSync: vi.fn(),
}));

const mockGetWalletClient = vi.fn();
const mockCreateWalletAccount = vi.fn();
const mockAuthenticateApiToken = vi.fn();

vi.mock('@dynamic-labs-wallet/node-evm', () => ({
  DynamicEvmWalletClient: vi.fn().mockImplementation(() => ({
    authenticateApiToken: mockAuthenticateApiToken,
    createWalletAccount: mockCreateWalletAccount,
    getWalletClient: mockGetWalletClient,
  })),
}));

vi.mock('@dynamic-labs-wallet/node', () => ({
  ThresholdSignatureScheme: { TWO_OF_TWO: 'TWO_OF_TWO' },
}));

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { getViemWalletClient } from './wallet.js';

describe('Server Wallet', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.DYNAMIC_AUTH_TOKEN = 'test-token';
    process.env.DYNAMIC_ENVIRONMENT_ID = 'test-env';
    process.env.DYNAMIC_WALLET_PASSWORD = 'test-pass';
  });

  describe('initialization', () => {
    it('a wallet that was already set up is reused — no new wallet is created', async () => {
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(JSON.stringify({ accountAddress: '0xExisting' }));
      const mockWalletClient = { account: { address: '0xExisting' } };
      mockGetWalletClient.mockResolvedValue(mockWalletClient);

      const result = await getViemWalletClient(12345, 'https://rpc.example.com');

      expect(mockCreateWalletAccount).not.toHaveBeenCalled();
      expect(mockGetWalletClient).toHaveBeenCalledWith(expect.objectContaining({
        accountAddress: '0xExisting',
      }));
      expect(result).toBe(mockWalletClient);
    });

    it('a first-time setup creates a new wallet and registers its address for future runs', async () => {
      vi.mocked(existsSync).mockReturnValue(false);
      mockCreateWalletAccount.mockResolvedValue({
        walletMetadata: { accountAddress: '0xNew' },
      });
      const mockWalletClient = { account: { address: '0xNew' } };
      mockGetWalletClient.mockResolvedValue(mockWalletClient);

      await getViemWalletClient(12345, 'https://rpc.example.com');

      expect(mockCreateWalletAccount).toHaveBeenCalledOnce();
      expect(writeFileSync).toHaveBeenCalledWith(
        '.wallet-state.json',
        JSON.stringify({ accountAddress: '0xNew' })
      );
    });

    it('the wallet is ready to sign on the correct chain and RPC endpoint', async () => {
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(JSON.stringify({ accountAddress: '0xExisting' }));
      mockGetWalletClient.mockResolvedValue({ account: { address: '0xExisting' } });

      await getViemWalletClient(999, 'https://arc-rpc.example.com');

      expect(mockGetWalletClient).toHaveBeenCalledWith(expect.objectContaining({
        chainId: 999,
        rpcUrl: 'https://arc-rpc.example.com',
      }));
    });
  });
});
