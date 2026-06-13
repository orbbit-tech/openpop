// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

// Copied verbatim from Chainlink CRE docs — not published as a package.
// Source: https://docs.chain.link/cre/guides/workflow/using-evm-client/onchain-write/building-consumer-contracts.md
import {IReceiver} from "./IReceiver.sol";
import {IERC165} from "./IERC165.sol";

abstract contract ReceiverTemplate is IReceiver, IERC165 {
    address private immutable i_forwarder;

    error UnauthorizedForwarder();

    constructor(address forwarder) {
        i_forwarder = forwarder;
    }

    modifier onlyForwarder() {
        if (msg.sender != i_forwarder) revert UnauthorizedForwarder();
        _;
    }

    function supportsInterface(bytes4 interfaceId) external view virtual returns (bool) {
        return interfaceId == type(IReceiver).interfaceId || interfaceId == type(IERC165).interfaceId;
    }
}
