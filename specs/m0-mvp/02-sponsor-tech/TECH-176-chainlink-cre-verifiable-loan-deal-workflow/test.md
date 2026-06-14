# Test Plan · CRE Workflow: Verifiable Loan Deal

**Layer:** Integration test

**Run:**
```
cd /Users/aphanmiz/Desktop/Orbbit/orbbit-codebase/hackathons/openpop-worktrees/TECH-176-cre-workflow/cre && PATH="$HOME/.cre/bin:$PATH" cre workflow simulate invoice-financing \
  --non-interactive \
  --trigger-index 0 \
  --http-payload '{"invoiceId":"GALLIVANT-001","amount":50000,"applicantName":"Gallivant Ice Cream"}' \
  --target staging-settings
```

---

## Tests

**Orchestration — the three steps run in sequence and produce a receipt**

- [happy-path] simulation exits 0 for a valid invoice payload
- [happy-path] result parses as valid JSON
- [happy-path] result contains `compliance`, `dairyPrice`, and `underwriting` keys — all three steps ran, no partial receipt
- [happy-path] top-level `verdict` is `"approved"`

**Step values — what each step returns**

- **Step 1 · Compliance**
  - [happy-path] `compliance.kyc` is `"pass"`
  - [happy-path] `compliance.kyb` is `"pass"`
  - [happy-path] `compliance.sanctions` is `"clear"`

- **Step 2 · Dairy price**
  - [happy-path] `dairyPrice.price` is `2.13`
  - [happy-path] `dairyPrice.unit` is `"USD/lb"`

- **Step 3 · Underwriting**
  - [happy-path] `underwriting.score` is `82`
  - [happy-path] `underwriting.approved` is `true`
  - [happy-path] `underwriting.maxAdvanceUsdc` is `40000` for a $50k invoice
  - [boundary] `underwriting.maxAdvanceUsdc` is `floor(amount × 0.8)` — the only non-hardcoded value
