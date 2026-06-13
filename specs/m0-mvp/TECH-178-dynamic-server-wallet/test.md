# Test Plan · Dynamic Server Wallet

**Layer:** TS Unit

**File:** `lib/wallet.test.ts`

**Run:** `npx vitest run lib/wallet.test.ts`

---

## Tests

**Server Wallet**

- **initialization**
  - [happy-path] a wallet that was already set up is reused — no new wallet is created
  - [happy-path] a first-time setup creates a new wallet and registers its address for future runs
  - [happy-path] the wallet is ready to sign on the correct chain and RPC endpoint
