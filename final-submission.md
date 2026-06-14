# OpenPop — Final Submission

---

## 01 Project Details

**What category does your project belong to?**
Developer Tool

**What emoji best represents your project?**
🔐

**If you have a demonstration, link to it here!**
_(add demo link when available)_

**Short description** *(max 100 characters)*
OpenPop: verifiable AI workflow framework. CRE receipts + MCP. Proof, not promises.

**Description** *(min 280 characters)*
OpenPop is a framework for making AI workflows verifiable by the people who need to trust the output — without trusting the operator. A developer wraps a TypeScript function in a Chainlink CRE workflow. Nine independent nodes each run it, and 7 of 9 must agree on the result before a signed receipt is produced. The receipt is stored in a flat file and exposed via an MCP server. Any AI agent can call `get_proof`, read the receipt, and act on it — no human relay, no PDFs, no phone calls.

The demo is an invoice factoring trust portal. Sneehee (Gallivant Ice Cream, Houston TX) submits a $50k Walmart invoice. The CRE workflow runs three sequential checks: a KYC/KYB compliance screen, a live USDA dairy cream price fetch paid with x402 nanopayments, and an underwriting score. The CRE CLI broadcasts the signed result to Arc testnet, where a `ProofGatedEscrow` contract holds investor USDC and releases it automatically when the receipt is valid. The investor's AI agent calls `get_proof` via MCP, reads the receipt independently, and returns a verdict — without being asked to trust anyone's word.

**How it's made** *(min 280 characters)*
The CRE workflow is a single TypeScript file (`cre/invoice-financing/main.ts`) using the `@chainlink/cre-sdk`. An `HTTPCapability` trigger receives the invoice payload. Three steps run in sequence:

**Step 1 — Compliance.** `ConfidentialHTTPClient` sends a POST to the compliance API endpoint with the business identity data and a vault-stored API key. The endpoint returns a KYC/KYB/OFAC verdict. In this demo the endpoint is a mock hosted in the Next.js app — but the call path (Chainlink enclave, vault secrets) is real CRE SDK code. Only the verdict exits the node.

**Step 2 — Dairy cream price.** `HTTPClientCapability.runInNodeMode` sends each of the 9 CRE nodes to fetch the price independently from a Next.js proxy. The proxy uses `x402-fetch` with a Dynamic server wallet (MPC, 2-of-2 threshold) to pay the live Orbbit dairy API per query. Prices are aggregated by median across nodes before the workflow continues.

**Step 3 — Underwriting.** Same pattern as compliance — `ConfidentialHTTPClient` calls the underwriting API with financial inputs and a vault secret. The endpoint returns a score and approval verdict. Mock endpoint in this demo; upgrade path is a real scoring model behind the same interface.

After all three steps, the workflow ABI-encodes `(uint256 dealId, bool approved)` and calls `EVMClient.writeReport()`, which submits the signed report to the `MockKeystoneForwarder` on Arc testnet. The Next.js API route (`/api/workflow/run`) spawns the CRE CLI via `spawnSync`, parses the result from stdout, and writes `proof.json` to disk.

The MCP server is a Next.js API route (`/api/mcp`) implementing the MCP Streamable HTTP protocol (version 2025-03-26). It exposes one tool — `get_proof` — that reads `proof.json` and returns it. Stateless: each request is a self-contained JSON-RPC exchange.

The investor clicks "Invest," signs in via Dynamic OTP email (no MetaMask), and gets an embedded wallet connected to Arc testnet. The UI calls three transactions in sequence — `createDeal`, `approve` USDC, and `deposit` — all signed by the embedded wallet. The `ProofGatedEscrow.sol` contract holds USDC per deal and calls `onReport` (via the Keystone Forwarder) when the signed CRE report arrives. It ABI-decodes `(dealId, approved)` from the report and either transfers USDC to Sneehee or marks the deal rejected. Policy evaluation lives entirely in the CRE workflow — the contract's only question is whether the Chainlink network signed the report.

---

## 02 Images

**Logo** *(512×512 square)*
_(attach square logo image)_

**Cover image** *(16:9, e.g. 640×360)*
_(attach cover image)_

---

## 03 Tech Stack

**Ethereum developer tools:**
None from the predefined list (CRE, Arc, Dynamic, and x402 are partner-specific)

**Blockchain networks:**
Arc

**Programming languages:**
TypeScript, Solidity, Python

**Web frameworks:**
Next.js, FastAPI

**Databases:**
None (proof stored as flat file `proof.json`)

**Design tools:**
Figma

**Other technologies, libraries, frameworks, or tools:**
Chainlink CRE SDK (`@chainlink/cre-sdk`), Chainlink ConfidentialHTTPClient, Chainlink HTTPClientCapability, x402 (`x402-fetch`), Dynamic embedded wallet (OTP email), Dynamic server wallet (MPC 2-of-2), MCP Streamable HTTP (2025-03-26), Arc `ProofGatedEscrow.sol`, viem

**How AI tools were used:**
Claude Code (Claude Sonnet) was the primary coding agent throughout — it wrote and iterated on the CRE workflow handler, the Next.js API routes, the MCP server, and the Arc escrow contract. Claude Code connected to the MCP server also plays the investor's AI agent in the demo: it calls `get_proof`, reads the signed receipt, and returns a verdict without any human relay — demonstrating the end-to-end verifiable workflow the framework is built around.

---

## 04 Judging & Prizes

**Partner prizes applying for (max 3):**

### Arc — $15,000

OpenPop deploys a conditional USDC escrow on Arc testnet. `ProofGatedEscrow.sol` holds investor funds per deal and releases them automatically when the Chainlink CRE receipt arrives and the approval flag is set. Rejection locks the funds with the reason recorded in the contract state. The investor deposits USDC directly from the Next.js UI using a Dynamic OTP-email embedded wallet — no external wallet required. There are three on-chain transactions per investor: `createDeal`, `approve` USDC, and `deposit`, all on Arc testnet.

The release is fully automatic: when `EVMClient.writeReport()` in the CRE workflow submits the signed report to the `MockKeystoneForwarder`, the forwarder calls `onReport` on the escrow contract, which decodes the verdict and transfers USDC to Sneehee if approved.

Line of code: `contracts/src/ProofGatedEscrow.sol` (escrow contract, `onReport` function at line 149), `apps/studio/src/components/invest/EscrowDeposit.tsx` (investor deposit UI)

Ease of use: 7/10

Additional feedback: Arc's EVM compatibility made it straightforward to deploy Solidity contracts and use standard viem tooling. Clearer documentation on `MockKeystoneForwarder` behavior (how it validates report bytes in simulation mode vs. the real `KeystoneForwarder`) would have saved several hours. A testnet faucet that's reliably available during hackathon hours would also help.

---

### Chainlink — $14,000

The entire three-step verification workflow runs inside a Chainlink CRE handler. Two of the three steps use `ConfidentialHTTPClient` from the CRE SDK — compliance (Step 1) and underwriting (Step 3) — which routes the request through the Chainlink enclave with vault-stored secrets so raw business data never reaches the operator. The dairy price step (Step 2) uses `HTTPClientCapability.runInNodeMode`, which runs each of the 9 CRE nodes independently and aggregates the price by median before continuing. The workflow ends with `EVMClient.writeReport()`, which encodes `(dealId, approved)` and submits to the `MockKeystoneForwarder` on Arc testnet via `cre workflow simulate --broadcast`.

In the current demo, the compliance and underwriting endpoints are mocks hosted in the Next.js app — they return fixture data. The CRE SDK wiring (ConfidentialHTTPClient, vault secrets, consensus) is real. Swapping the mock endpoints for production APIs requires no CRE code changes.

Line of code: `cre/invoice-financing/main.ts` (workflow handler), `cre/invoice-financing/steps/compliance.ts` (ConfidentialHTTPClient), `cre/invoice-financing/steps/dairy-commodity-price.ts` (HTTPClientCapability + runInNodeMode), `cre/invoice-financing/steps/underwriting.ts` (ConfidentialHTTPClient)

Ease of use: 6/10

Additional feedback: The `cre simulate --broadcast` flow is powerful. The biggest friction was the CLI output format — the result is a JSON-stringified JSON string embedded in prose stdout, which required double-parsing. A documented result extraction pattern or a `--output-json` flag would save significant integration time. Error messages when a step fails inside the runner are generic timeouts rather than step-level failures — harder to debug.

---

### Dynamic — $10,000

Dynamic is used in two distinct places.

**Server wallet** (`apps/studio/src/app/api/dairy-price/route.ts`): A 2-of-2 MPC server wallet (`DynamicEvmWalletClient`, `ThresholdSignatureScheme.TWO_OF_TWO`) is bootstrapped once via `scripts/create-server-wallet.ts`. The `/api/dairy-price` route uses this wallet with `wrapFetchWithPayment` from `x402-fetch` to pay per query for the live USDA dairy cream price. No human signs the payment — the server wallet handles it fully automatically.

**Embedded wallet** (`apps/studio/src/components/invest/EscrowDeposit.tsx`): The investor signs in via OTP email, which creates a Dynamic-managed embedded wallet. The wallet is configured to Arc testnet via `DynamicContextProvider` with a custom network entry. The investor then signs three Arc transactions directly from the browser: `createDeal`, `approve` USDC, and `deposit`. No MetaMask, no external wallet, no address copy-paste.

Line of code: `apps/studio/src/app/api/dairy-price/route.ts` (server wallet + x402), `scripts/create-server-wallet.ts` (server wallet bootstrap), `apps/studio/src/components/invest/EscrowDeposit.tsx` (embedded wallet deposit), `apps/studio/src/components/DynamicProvider.tsx` (Arc testnet config)

Ease of use: 8/10

Additional feedback: The OTP embedded wallet flow worked well for the investor UX — sign in with email, no friction. The server wallet API is clean. Main friction: the `getWalletClient()` call requires passing the chain explicitly — it wasn't obvious from docs that this was required for `x402-fetch` to work. A "sign and pay x402" example in the docs using the Node SDK would remove that gap entirely.

---

**Other partner technologies used (not applying for prizes):**
_(none additional)_

---

## 05 Video Upload

**Demo video** *(2–4 min, ≥720p, audio without music, .mp4 or .mov)*
_(attach demo video)_

---

## 06 Future Opportunities

**Are you interested in continuing this project?**
- [x] Interested in grant programs
- [x] Interested in accelerator/incubator programs

**Notes:**
The invoice factoring demo is one instance of a structural problem that repeats across finance, legal, healthcare, supply chain, and real estate: Party A runs a workflow. Party B cannot act until they trust the output. Today that trust is a manual step — an email, a PDF, a phone call. OpenPop replaces that step with a cryptographic receipt any agent can verify autonomously. We are interested in grant support to move the compliance and underwriting steps from mock endpoints to real APIs, to productionize the Chainlink ConfidentialHTTPClient integration with an actual external compliance provider, and to generalize the verified() abstraction beyond the invoice factoring use case.
