---
name: feedback-spec-path-openpop
description: In the OpenPop project, spec files use a flat path matching the Linear milestone slug — no layer folder
metadata:
  type: feedback
---

For the OpenPop hackathon project, the spec directory structure is:
`specs/<milestone-slug>/<TECH-N-issue-slug>/spec.md`

Milestone slug is derived from the Linear milestone name (lowercase, hyphenated):
- "M0 — Minimum Viable" → `m0-minimum-viable`
- "M1 — Enhanced" → `m1-enhanced`
- "M2 — Confidential AI (booth credentials only)" → `m2-confidential-ai`

**Why:** The layered folder structure (01-domain-libs, 02-integration-libs, etc.) is from Orbbit's main codebase and doesn't apply here. The milestone slug must match the Linear milestone name, not the CLAUDE.md build layer labels (L0/L1/L2 are different from M0/M1/M2).

**How to apply:** When writing specs in OpenPop, use `specs/m0-minimum-viable/TECH-N-slug/spec.md`. Never use `l0-minimum-viable` — that was wrong. Never add a layer subfolder between milestone and issue slug.
