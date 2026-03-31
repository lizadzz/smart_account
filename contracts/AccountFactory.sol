// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "./Account.sol";
import "@openzeppelin/contracts/utils/Create2.sol";

contract AccountFactory {
    event AccountCreated(
        address indexed account,
        address indexed owner,
        uint256 nonce
    );

    mapping(address => uint256) public accountNonces;

    function createAccount(
        address _owner,
        address _entryPoint,
        uint256 _nonce
    ) external returns (address) {
        uint256 currentNonce = accountNonces[_owner]++;
        bytes32 salt = keccak256(abi.encode(_owner, _entryPoint, currentNonce));

        bytes memory bytecode = abi.encodePacked(
            type(Account).creationCode,
            abi.encode(_owner, _entryPoint)
        );

        address addr = Create2.computeAddress(salt, keccak256(bytecode));

        if (addr.code.length == 0) {
            addr = Create2.deploy(0, salt, bytecode);
            emit AccountCreated(addr, _owner, currentNonce);
        }

        return addr;
    }

    function getAccountAddress(
        address _owner,
        address _entryPoint,
        uint256 _nonce
    ) external view returns (address) {
        bytes32 salt = keccak256(abi.encode(_owner, _entryPoint, _nonce));
        bytes memory bytecode = abi.encodePacked(
            type(Account).creationCode,
            abi.encode(_owner, _entryPoint)
        );
        return Create2.computeAddress(salt, keccak256(bytecode));
    }
}
