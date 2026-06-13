# Test Planning Reference

**What:** List every test that needs to be written before touching any code.

**Why:** Tests derived from the spec — not from the code — make sure every stated requirement gets checked.

**How:** Read the spec, identify every behavior the code being tested must exhibit, list them ordered by importance, and wait for approval before writing any code.

---

## Step 1 · Identify testable behaviors

**If the spec contains a logic diagram (flowchart, SOP, sequence diagram), read the diagram first — it is the primary source of tests.** Map graph elements to tests in this order:

| Graph element | Tests to write | Category tag |
|---|---|---|
| Branch arm (diamond node) | One per arm — does the subject take the right path when the condition is true? | happy-path / unhappy-path |
| Blocking wait / condition node | One per node — does the subject actually stay blocked until the condition is met? | invariant |
| Always/Never invariant in spec not covered above | One per invariant | invariant |

Identify testable behaviors from the spec text using these questions:

| Category | Question |
|---|---|
| [happy-path] | What is the correct outcome for valid input — return value, state change, or side effect? |
| [boundary] | Are edge-case inputs handled safely — null, empty, min/max values, invalid format? |
| [unhappy-path] | Does it fail gracefully for bad input or error state — right error type, no state corruption? |
| [invariant] | What property must always hold or never occur, regardless of input? |

---

## Step 2 · Group by method name; categorize within each method

**Outer grouping = method name.** Each method gets its own bold heading. Tests within the method are listed with their category tag and a plain English description of what happens — not repeating the method name.

**Optional higher-level grouping by domain** — only when the subject has two or more meaningfully distinct entity types (e.g. Verification vs Report vs Decision). If the subject has one entity type, skip the domain level and go straight to method headings.

**Within each method, order by category:**
1. [happy-path] — valid input, expected return value or state change
2. [boundary] — edge-case inputs (null, empty, min/max)
3. [unhappy-path] — bad input or error state, correct failure behavior
4. [invariant] — properties that must always hold or never occur

**Test descriptions are plain English business intent** — describe what the system does in that case, not the implementation detail. The method name is already the heading; do not repeat it in the description.

- Good: `[happy-path] a new assessment opens in pending state`
- Bad: `[happy-path] createAssessment opens a new assessment in pending state` ← method name repeated

---

## Step 3 · Write test.md and wait for approval

Write the test plan to `specs/.../issue-id-slug/test.md` in the worktree. Print only the file path — never print the file contents in the terminal. The human opens the file in VS Code to review.

```markdown
# Test Plan · [Issue title]

**Layer:** [layer]

**File:** `[path/to/file.test.ts]`

**Run:** `[command to execute the tests]`

---

## Tests

**SubjectClass**

- **[Domain]** ← optional, only when 2+ distinct entity types exist
  - **methodName**
    - [happy-path] plain English description
    - [boundary] plain English description
    - [unhappy-path] plain English description
    - [invariant] plain English description

- **methodName** ← use directly when no domain grouping
  - [happy-path] plain English description
  - [unhappy-path] plain English description
```

After writing, print the absolute path and wait for explicit approval. Do not write any test code until approved.
