// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

// EIP-165 interface detection — required by ReceiverTemplate so the Keystone Forwarder
// can verify this contract implements IReceiver before routing a report to it.
// Copied verbatim from Chainlink CRE docs (identical to @openzeppelin/contracts IERC165).
// Source: https://docs.chain.link/cre/guides/workflow/using-evm-client/onchain-write/building-consumer-contracts.md
interface IERC165 {
    function supportsInterface(bytes4 interfaceId) external view returns (bool);
}
