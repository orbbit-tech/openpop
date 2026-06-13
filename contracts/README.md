# ProofGatedEscrow — Contracts

Solidity contracts for OpenPop's proof-gated invoice factoring. `ProofGatedEscrow` holds USDC and releases it only when a Chainlink CRE-signed receipt (via `onReport`) confirms compliance and underwriting passed.

## Structure

```
contracts/
├── src/
│   ├── ProofGatedEscrow.sol        # main contract
│   └── interfaces/
│       ├── IReceiver.sol           # Chainlink Keystone consumer interface
│       ├── IERC165.sol             # required by ReceiverTemplate
│       └── ReceiverTemplate.sol    # onlyForwarder modifier + supportsInterface
├── test/
│   └── ProofGatedEscrow/
│       └── ProofGatedEscrow.t.sol  # 9 Forge unit tests
├── scripts/
│   ├── deploy.ts                   # deploys ProofGatedEscrow
│   └── setup.ts                    # creates deal + deposits 50 USDC (from faucet)
├── foundry.toml
└── hardhat.config.ts               # Arc testnet network config
```

## Prerequisites

- [Foundry](https://getfoundry.sh) — `forge`, `cast`
- Node 18+ and `npm`
- An EOA funded with USDC on Arc testnet (chain 5042002)

## Setup

```bash
# from this directory
npm install
```

## Run tests

```bash
forge test
```

## Deploy to Arc testnet

All commands run from this `contracts/` directory.

### Step 1 — set your deployer private key (one-time)

```bash
npx hardhat keystore set DEPLOYER_PRIVATE_KEY
```

Paste your EOA private key when prompted. Stored AES-encrypted by `hardhat-keystore` — never touches `.env.local`.

### Step 2 — set env vars

Create `../.env.local` from the root `.env.example` and fill in:

```
USDC_ADDRESS=0x3600000000000000000000000000000000000000   # Arc testnet USDC system contract
RECIPIENT_ADDRESS=0xRecipientWallet                         # receives USDC on approval
```

### Step 3 — compile

```bash
npx hardhat compile
```

### Step 4 — deploy

```bash
npx hardhat run scripts/deploy.ts --network arc-testnet
```

Output:
```
Deploying from: 0x...
PROOF_GATED_ESCROW_ADDRESS=0x...
```

Add the printed address to `../.env.local`:
```
PROOF_GATED_ESCROW_ADDRESS=0x...
```

### Step 5 — get USDC from faucet

The deployer wallet needs USDC on Arc testnet before depositing. Get it from the [Arc faucet](https://faucet.arc.network) or the [ArcSend tool](https://arc-send.netlify.app).

`setup.ts` uses 50 USDC (`50_000_000` at 6 decimals) — adjust `DEPOSIT_AMOUNT` in the script if your faucet gives a different amount.

### Step 6 — create deal and deposit

```bash
npx hardhat run scripts/setup.ts --network arc-testnet
```

Output:
```
USDC balance: 50000000
Deal created. DEAL_ID=1
Deposited 50000000 USDC into deal 1
```

The escrow now holds 50 USDC locked against deal 1, waiting for `onReport` from the MockKeystoneForwarder.

## Contract addresses (Arc testnet)

| Contract | Address |
|---|---|
| USDC (ERC-20 system contract) | `0x3600000000000000000000000000000000000000` |
| MockKeystoneForwarder | `0x6E9EE680ef59ef64Aa8C7371279c27E496b5eDc1` |
| ProofGatedEscrow | fill in after deploy |
