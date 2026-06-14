# Test Plan · Dynamic Embedded Wallet in InvestSheet

**Layer:** none — no isolated business logic

**Reason:** Every Action Item is a React component or wiring step. The approve→deposit ordering is enforced by sequential awaits in `EscrowDeposit.tsx` — there is no extractable pure function. React component testing requires a setup that does not exist in this project.

**Acceptance criteria (run after implementation):**

1. `cd apps/studio && npx tsc --noEmit` → exits 0
2. Open `http://localhost:3000` → click **Invest** in Nav → sheet opens
3. Enter email → OTP arrives → enter OTP → sheet switches to deposit form
4. Enter amount → click Deposit → status shows `approving` then `depositing` then Arc tx hash link
