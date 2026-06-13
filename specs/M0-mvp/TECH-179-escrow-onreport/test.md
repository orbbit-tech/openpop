# Test Plan · ProofGatedEscrow — onReport interface, Arc deploy, demo deal setup

**Layer:** Contracts (Foundry unit tests)

**File:** `contracts/test/ProofGatedEscrow/ProofGatedEscrow.t.sol`

**Run:** `cd contracts && forge test`

---

## Tests

**ProofGatedEscrow**

- **onReport**
  - [happy-path] authorized forwarder delivers an approved verdict — USDC is transferred to recipient and `Released` event is emitted
  - [happy-path] authorized forwarder delivers a rejected verdict — deal is marked `REJECTED` and `Rejected` event is emitted
  - [invariant] contract USDC balance is exactly zero immediately after a successful release
  - [unhappy-path] caller is not the registered forwarder — call reverts before any state change
  - [unhappy-path] deal state is not `FUNDED` when `onReport` is called — call reverts

- **createDeal**
  - [happy-path] deal is stored with correct recipient and `nextDealId` increments (carry-over)
  - [unhappy-path] zero address as recipient reverts (carry-over)

- **deposit**
  - [happy-path] investor deposits USDC and the full amount is locked inside the contract (carry-over)
  - [unhappy-path] second deposit on the same deal reverts (carry-over)
