# Test Plan · Move offchain services into studio

**Layer:** Next.js API integration (vitest) — static route handlers, no mocks needed
**Files:**
- `apps/studio/__tests__/api/compliance/route.test.ts`
- `apps/studio/__tests__/api/underwriting/route.test.ts`
**Run:** `cd apps/studio && npx vitest run __tests__/api/compliance __tests__/api/underwriting`

---

## Tests

**POST /api/compliance**

- **POST**
  - [happy-path] returns 200 with `kyc === "pass"`, `kyb === "pass"`, `sanctions === "clear"`

---

**POST /api/underwriting**

- **POST**
  - [happy-path] returns 200 with `score === 82`, `approved === true`, `maxAdvanceUsdc === 40000`
