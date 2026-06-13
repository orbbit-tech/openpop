---
name: feedback-spec-format-openpop
description: Spec format rules for OpenPop — no Test Types section; tests go as an Action Item
metadata:
  type: feedback
---

Do NOT include a "Test Types" section (✅/❌ unit/contract/E2E) in spec.md.

If tests are needed, add a test Action Item in the Action Items section instead. If no tests are needed, just omit testing entirely — don't document the absence.

**Why:** A section full of ❌ is noise. The right place for test intent is an Action Item with a concrete Verify command. Tests are always the preferred way to verify logic — don't write off unit tests just because the code touches I/O; mock the boundaries.

**How to apply:** After drafting Action Items, check if any exported function has conditional logic or multiple branches. If yes → add a unit test Action Item. If the spec is pure config/infra with no branches → omit tests silently (no section needed).
