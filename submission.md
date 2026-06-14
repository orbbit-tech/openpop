Prize Submissions


ARC — $15,000

Why we're applicable:
Arc is the chain where the escrow contract lives and where the proof gets verified. Every investor deposit, deal creation, and USDC release happens on Arc Testnet. The escrow contract won't release funds until it receives the Chainlink signed receipt on-chain — Arc is what makes that settlement trustless and final.

Line of code:
https://github.com/orbbit-tech/openpop/blob/ba72c707a0cb750ee68f10ed823ce418addad1b0/apps/studio/src/lib/arc.ts#L21

Ease of use: 7

Feedback:
The RPC worked reliably throughout the hackathon. The main friction was that Arc Testnet is not in most wallet SDKs by default, so we had to register it manually as a custom network (chain ID 5042002). Docs on how to configure custom networks with common wallet providers (Dynamic, wagmi, viem) would save time. Arcscan was useful for debugging events — a public ABI for the Chainlink forwarder contract would make log decoding easier without having to hardcode keccak256 topic signatures.


CHAINLINK — $14,000

Why we're applicable:
Chainlink CRE is the core of OpenPop. The entire invoice screening workflow — compliance, commodity price, underwriting — runs as a CRE handler in TypeScript. Seven of nine CRE nodes must reach BFT consensus before the output is signed. That signed receipt is what makes the proof trustworthy: no single server produced it. We also use EVMClient.writeReport() to submit the receipt on-chain to the Arc escrow contract.

Line of code:
https://github.com/orbbit-tech/openpop/blob/ba72c707a0cb750ee68f10ed823ce418addad1b0/cre/invoice-financing/main.ts#L34

Ease of use: 6

Feedback:
The SDK is well-designed once you understand the mental model. The trickiest part was learning that runtime.now() must be used instead of Date.now() inside handlers — Date.now() is non-deterministic across nodes and silently breaks consensus without a clear error. That constraint should be in the getting-started guide. The CLI output wraps the workflow result in prose text rather than structured JSON, which made parsing fragile (we had to JSON.parse twice to unwrap it). A --json flag on cre workflow simulate would make integration much cleaner. Simulation mode is great for local development — the workflow ran end-to-end without needing a live network.


DYNAMIC — $10,000

Why we're applicable:
Dynamic handles wallets on both sides of the product. Investors use Dynamic's embedded wallet to deposit USDC directly from the browser — no MetaMask or external extension required. On the backend, the Dynamic Node.js server wallet signs the x402 micropayment to fetch live dairy price data and signs the submitProof transaction to the escrow contract — fully automated, no human in the loop. One SDK, two completely different wallet roles.

Line of code (embedded wallet — investor deposit):
https://github.com/orbbit-tech/openpop/blob/ba72c707a0cb750ee68f10ed823ce418addad1b0/apps/studio/src/components/invest/EscrowDeposit.tsx#L95

Line of code (server wallet — x402 payment):
https://github.com/orbbit-tech/openpop/blob/ba72c707a0cb750ee68f10ed823ce418addad1b0/apps/studio/src/app/api/workflow/run/route.ts#L45

Ease of use: 8

Feedback:
The embedded wallet integration was the smoothest part of the whole build. The React SDK dropped in with minimal config and the mergeNetworks helper made adding Arc Testnet as a custom network straightforward. The server wallet (Node.js EVM client) took more trial and error — the authentication flow with API token + password unlock is not well documented for headless/server use cases. A dedicated guide for server-side wallet usage with code examples would help a lot. OTP sign-in for email-based wallets also worked well in the investor flow.
