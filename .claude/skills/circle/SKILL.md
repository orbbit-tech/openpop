---
name: circle
description: "Circle product skills for OpenPop — USDC token operations, Smart Contract Platform (deploy/call contracts on Arc), CCTP stablecoin bridging, x402 pay-per-call API payments, and Circle Gateway cross-chain USDC. Triggers on: USDC balance, send USDC, transfer USDC, USDC contract address, deploy contract, smart contract ABI, call contract, submitProof, releaseToRecipient, bridge USDC, crosschain transfer, CCTP, move USDC between chains, x402, micropayment, pay-per-call, paid API, pay for API, dairy price API, Circle Gateway, unified balance, nanopayments, GatewayWalletBatched."
---

# Circle Skills

Read the relevant reference file before answering. Do not rely on memory.

## References

| Concern | Reference |
|---|---|
| USDC token — balances, transfers, contract address on Arc | `references/use-usdc.md` |
| USDC EVM specifics — viem, parseUnits, ATA | `references/use-usdc-evm.md` |
| Deploy contract to Arc via Circle SCP API | `references/use-smart-contract-platform.md` |
| Deploy from bytecode | `references/use-scp-deploy-bytecode.md` |
| ABI-based contract calls (submitProof, releaseToRecipient) | `references/use-scp-interact.md` |
| Monitor contract events via webhook | `references/use-scp-monitor-events.md` |
| Bridge USDC cross-chain (investor's any-chain deposit via CCTP) | `references/bridge-stablecoin.md` |
| Bridge with private key adapter (Dynamic server wallet pattern) | `references/bridge-adapter-private-key.md` |
| x402 pay-per-call flow (dairy price API payment) | `references/pay-via-agent-wallet.md` |
| Circle Gateway — cross-chain USDC routing | `references/use-gateway.md` |
| Gateway — deposit EVM USDC | `references/use-gateway-deposit-evm.md` |
| Gateway — EVM-to-EVM transfer | `references/use-gateway-evm-to-evm.md` |
| Gateway — query balance | `references/use-gateway-query-balance.md` |
