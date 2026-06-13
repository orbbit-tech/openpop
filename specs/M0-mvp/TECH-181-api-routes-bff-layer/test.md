# Test Plan · API Routes — BFF Layer

**Layer:** Next.js API integration (vitest) — route handlers with mocked child_process and fs; tests handler wiring, not pure logic
**Files:**
- `apps/studio/src/app/api/workflow/run/__tests__/route.test.ts`
- `apps/studio/src/app/api/proof/__tests__/route.test.ts`
- `apps/studio/src/app/api/mcp/__tests__/route.test.ts`
**Run:** `cd apps/studio && npx vitest run`

---

## Tests

**POST /api/workflow/run**

Mock: `vi.mock('node:child_process')` spawnSync · `vi.mock('node:fs')` writeFileSync

- **POST**
  - [happy-path] CRE exits 0 → returns 200 with Receipt whose `compliant`, `score`, `approved`, and `dairyPrice` are shaped from CRE stdout
  - [happy-path] `compliant` is true when compliance has kyc=pass, kyb=pass, sanctions=clean
  - [boundary] `compliant` is false when any one compliance field deviates from the passing value
  - [happy-path] `approved` reflects underwriting.approved from CRE stdout
  - [unhappy-path] CRE exits non-zero → returns 500 and writeFileSync is not called
  - [unhappy-path] CRE stdout is not valid JSON → returns 500 and writeFileSync is not called

---

**GET /api/proof**

Mock: `vi.mock('fs/promises')` readFile

- **GET**
  - [happy-path] proof.json exists → returns 200 with the full Receipt object
  - [unhappy-path] proof.json does not exist (ENOENT) → returns 404 with `{ error: 'no proof found' }`
  - [unhappy-path] proof.json contains invalid JSON → returns 500

---

**POST /api/mcp**

Mock: `vi.mock('fs/promises')` readFile

- **POST**
  - [happy-path] method `initialize` → returns 200 with `protocolVersion`, `capabilities`, and `serverInfo.name === "openpop-mcp"`
  - [happy-path] method `tools/list` → returns 200 with a tools array containing one entry named `get_proof`
  - [happy-path] method `tools/call` with `params.name === "get_proof"` → returns 200 with `content[0].type === "text"` containing receipt JSON
  - [unhappy-path] method `tools/call` with an unknown tool name → returns 400 with JSON-RPC error code `-32601`
  - [unhappy-path] unknown method → returns 400
