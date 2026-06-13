// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

// Copied verbatim from Chainlink CRE docs — not published as a package.
// Source: https://docs.chain.link/cre/guides/workflow/using-evm-client/onchain-write/building-consumer-contracts.md
interface IReceiver {
    function onReport(bytes calldata metadata, bytes calldata report) external;
}
