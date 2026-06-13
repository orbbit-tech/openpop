// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract MockForwarder {
    bool private _result;
    constructor(bool result_) { _result = result_; }
    function verify(bytes calldata) external view returns (bool) { return _result; }
}
