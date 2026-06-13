---
name: feedback-spec-titles-openpop
description: Spec titles name the deliverable, not the implementation — keep them short
metadata:
  type: feedback
---

Spec and test.md titles should name the feature being built, not describe what it does or how it's used.

**Why:** Implementation details belong in the spec body. A long title like "server wallet pays dairy price feed (x402) and submits proof on-chain" repeats the spec content and makes files harder to scan.

**How to apply:** Title = the thing being built. One noun phrase, 2–4 words. Examples:
- ✅ "Dynamic Server Wallet"
- ✅ "ProofGatedEscrow Contract"
- ✅ "CRE Screening Workflow"
- ❌ "Dynamic Wallet — server wallet pays dairy price feed (x402) and submits proof on-chain"
