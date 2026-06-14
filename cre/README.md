# CRE Workflow — OpenPop Loan Verification

Runs a 3-step compliance and underwriting workflow locally via the Chainlink CRE CLI. With `--broadcast`, it submits a signed receipt to `ProofGatedEscrow` on Arc testnet and returns a real on-chain tx hash.

## Project structure

```
cre/
  project.yaml          ← RPC endpoint for Arc testnet
  secrets.yaml          ← secret name declarations (empty — no Vault DON secrets needed for simulation)
  .env                  ← CRE_ETH_PRIVATE_KEY (never commit)
  loan/
    main.ts             ← 3-step workflow handler
    workflow.yaml       ← target "staging-settings"
    config.staging.json ← consumerAddress, dealId, chainSelectorName
    steps/
      compliance.ts           ← KYC / KYB / sanctions check (hits offchain-services on :8787)
      dairy-commodity-price.ts ← USDA cream price (from trigger payload or mock config)
      underwriting.ts          ← score + approval decision (hits offchain-services on :8787)
```

## Prerequisites

**1. CRE CLI**
```bash
curl -sSfL https://cre.chain.link/install.sh | bash
cre version   # must be v1.20.0+
```

**2. Install workflow dependencies** (run once)
```bash
cd loan && bun install && cd ..
```

**3. Arc testnet USDC**

Gas on Arc is paid in USDC. Get testnet USDC from [faucet.circle.com](https://faucet.circle.com/) and select Arc Testnet.

**4. `.env` file**

Copy the example and fill in your private key:
```bash
cp .env.example .env
# edit .env — set CRE_ETH_PRIVATE_KEY to your funded Arc testnet wallet private key
```

## Running the simulation

Open **two terminals**.

**Terminal 1 — start offchain services** (compliance + underwriting endpoints):
```bash
cd loan && npx ts-node mock-server.ts
# Mock server listening on :8787
```

**Terminal 2 — run the CRE workflow:**
```bash
cd cre   # must run from here (project root, where project.yaml lives)

cre workflow simulate loan \
  --target staging-settings \
  --broadcast \
  --non-interactive \
  --trigger-index 0 \
  --http-payload '{"invoiceId":"gallivant-001","amount":50000,"businessName":"Gallivant Ice Cream"}'
```

`--broadcast` deploys a `MockKeystoneForwarder` on Arc testnet and calls `submitProof` on `ProofGatedEscrow`. The output includes a real Arc testnet tx hash.

## What the workflow does

1. **Compliance** — POST to `:8787/compliance` via `ConfidentialHTTPClient` → KYC / KYB / OFAC result
2. **Dairy price** — reads `dairyPriceUsdPerLb` from the trigger payload (or falls back to `config.staging.json` mock value)
3. **Underwriting** — POST to `:8787/underwriting` via `ConfidentialHTTPClient` → score + approval decision
4. **On-chain write** — encodes `(dealId, approved)`, signs via CRE, submits to `ProofGatedEscrow` through `MockKeystoneForwarder`

The workflow returns JSON to stdout. `apps/studio/src/app/api/workflow/run/route.ts` parses this and writes `proof.json`.

## Config

`loan/config.staging.json` — key fields:

| Field | Value |
|---|---|
| `consumerAddress` | `ProofGatedEscrow` address on Arc testnet |
| `dealId` | Deal ID to settle (default: `1`) |
| `chainSelectorName` | `arc-testnet` |
| `dairyPriceMockUsdPerLb` | Fallback price when not passed in trigger payload |
