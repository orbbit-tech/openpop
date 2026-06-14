# Test Plan · x402 Dairy Price Fetch — BFF Layer

**Layer:** Next.js API integration (vitest) — extends existing route.test.ts with x402-fetch mock and two new cases

**File:** `apps/studio/__tests__/api/workflow/run/route.test.ts`

**Run:** `cd apps/studio && npx vitest run`

---

## Tests

**POST /api/workflow/run — x402 dairy price fetch**

Mock: `vi.mock('x402-fetch')` wrapFetchWithPayment returns `{ price: 2.34, unit: 'USD/lb' }` · `vi.mock('viem')` createWalletClient stub · `vi.mock('viem/accounts')` privateKeyToAccount stub · `vi.mock('viem/chains')` baseSepolia stub

- **dairy price injection**
  - [happy-path] x402 fetch returns price → `dairyPriceUsdPerLb: 2.34` is present in the `--http-payload` arg passed to `spawnSync`
  - [unhappy-path] x402 fetch throws → returns 500 and `spawnSync` is not called
