# Test Plan · ProofEscrow on Arc

**Layer:** Contract unit

**File:** `contracts/test/ProofEscrow.test.ts`

**Run:** `cd contracts && npx hardhat test`

---

## Tests

**ProofEscrow**

- **depositUSDC**
  - [happy-path] investor deposits USDC and the full amount is locked inside the contract
  - [unhappy-path] a second deposit while funds are already locked reverts

- **submitProof**
  - [happy-path] valid signature, compliance passed, score above threshold — USDC is released to the recipient and Released event is emitted
  - [unhappy-path] valid signature, compliance passed, score below threshold — funds stay locked and Rejected event is emitted with a reason
  - [unhappy-path] forwarder rejects the signature — call reverts before any state changes
  - [unhappy-path] submitProof called before any deposit has been made — reverts
  - [invariant] contract USDC balance is exactly zero after a successful release — no funds remain
