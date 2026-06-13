# Dynamic Server Wallet

Orchestrates one end-to-end OpenPop screening run: fetches a live dairy price (paid via x402), runs the CRE screening workflow, submits the signed proof to the Arc escrow contract, and writes `receipt.json` — with no human in the loop at any step.

---

## Prerequisites

| Tool | Version | Notes |
|------|---------|-------|
| Node.js | 20+ | `--env-file` flag requires Node 20 |
| `cre` CLI | latest | `npm i -g @chainlink/cre-cli` |
| npm / pnpm | any | for installing deps |

---

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create your `.env`

```bash
cp .env.example .env
```

Then fill in the values — see the table below.

### 3. Fund the server wallet

On first run, a new Dynamic wallet is created and its address saved to `.wallet-state.json`.
Fund that address with testnet USDC from https://faucet.circle.com before running the orchestrator.

---

## Environment Variables

| Variable | Where to get it |
|----------|----------------|
| `DYNAMIC_AUTH_TOKEN` | [app.dynamic.xyz](https://app.dynamic.xyz) → your environment → **API** → Server-to-Server auth token |
| `DYNAMIC_ENVIRONMENT_ID` | Same page — the **Environment ID** shown at the top |
| `DYNAMIC_WALLET_PASSWORD` | You choose. Encrypts the local key share. Write it down — losing it means losing the wallet. |
| `ARC_RPC_URL` | Fixed: `https://rpc.testnet.arc.network` (already in `.env.example`) |
| `ARC_CHAIN_ID` | Fixed: `5042002` (already in `.env.example`) |
| `PROOF_ESCROW_ADDRESS` | Deployed by TECH-177 — copy the `ProofGatedEscrow` address from that deploy output |
| `DAIRY_API_URL` | Orbbit AWS Lambda endpoint — ask the team or check the Orbbit deployment config |

---

## Running

```bash
npm start
```

This runs `tsx --env-file=.env scripts/run.ts`, which:

1. Initialises (or reloads) the Dynamic server wallet
2. Fetches the live dairy cream price via x402 — the wallet signs the micropayment automatically
3. Runs `cre workflow simulate --broadcast` and parses the signed receipt
4. Calls `ProofGatedEscrow.submitProof` on Arc testnet and captures the tx hash
5. Writes `receipt.json` with `{ dairyPrice, creReceipt, arcTxHash, walletAddress }`

On success:

```
Receipt written. Arc tx: 0x...
```

---

## Tests

```bash
npm test
```

Unit tests cover the create-or-load wallet branch in `lib/wallet.ts`. No network calls — the Dynamic SDK and `node:fs` are mocked.

---

## Runtime files

Both are gitignored and created at runtime:

| File | Contents |
|------|----------|
| `.wallet-state.json` | `{ accountAddress }` — persists the wallet across runs |
| `receipt.json` | `{ dairyPrice, creReceipt, arcTxHash, walletAddress }` — output consumed by the MCP server and UI |

---

## Arc Testnet reference

| Field | Value |
|-------|-------|
| Chain ID | `5042002` |
| RPC | `https://rpc.testnet.arc.network` |
| Explorer | https://testnet.arcscan.app |
| Faucet | https://faucet.circle.com |
| USDC | `0x3600000000000000000000000000000000000000` |
