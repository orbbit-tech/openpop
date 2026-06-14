# Test Plan · Wire up dairy price proxy in Next.js and update CRE workflow to call it

**Layer:** Next.js API integration (vitest) — new route + update existing route test

**Files:**
- `apps/studio/__tests__/api/dairy-price/route.test.ts` (new)
- `apps/studio/__tests__/api/workflow/run/route.test.ts` (updated — remove two x402 cases that break after dairy fetch is removed)

**Run:** `cd apps/studio && npx vitest run`

---

## Tests

**GET /api/dairy-price**

Mock: `vi.mock('x402-fetch')` wrapFetchWithPayment returns `{ price: 2.13, unit: 'USD/lb' }` · `vi.mock('viem')` createWalletClient stub · `vi.mock('viem/accounts')` privateKeyToAccount stub · `vi.mock('viem/chains')` baseSepolia stub

- **GET**
  - [happy-path] x402 fetch succeeds → returns 200 with `{ price: 2.13, unit: 'USD/lb' }`
  - [unhappy-path] x402 fetch throws → returns 500

---

**POST /api/workflow/run — x402 dairy fetch removed**

- **dairy price injection (DELETE these two cases)**
  - ~~[happy-path] x402 fetch returns price → `dairyPriceUsdPerLb` in `--http-payload`~~
  - ~~[unhappy-path] x402 fetch throws → 500, spawnSync not called~~
- **trigger payload**
  - [happy-path] trigger payload sent to CRE does not contain `dairyPriceUsdPerLb`
