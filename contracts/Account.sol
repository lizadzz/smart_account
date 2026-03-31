// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "@account-abstraction/contracts/interfaces/IAccount.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/Create2.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract Account is IAccount, ReentrancyGuard {
    address public owner;
    address public immutable entryPoint;

    event OwnerChanged(address indexed oldOwner, address indexed newOwner);
    event Executed(address indexed dest, uint256 value, bytes data);

    constructor(address _owner, address _entryPoint) {
        owner = _owner;
        entryPoint = _entryPoint;
    }

    modifier onlyEntryPoint() {
        require(msg.sender == entryPoint, "NOT_ALLOWED");
        _;
    }

    function validateUserOp(
        UserOperation calldata userOp,
        bytes32 userOpHash,
        uint256 missingAccountFunds
    ) external view override returns (uint256) {
        address recovered = ECDSA.recover(userOpHash, userOp.signature);

        if (recovered != owner) {
            return 1;
        }

        return 0;
    }

    function execute(
        address dest,
        uint256 value,
        bytes calldata func
    ) external onlyEntryPoint nonReentrant {
        (bool success, ) = dest.call{value: value}(func);
        require(success, "CALL_FAILED");
        emit Executed(dest, value, func);
    }

    function isValidSignature(
        bytes32 hash,
        bytes memory signature
    ) external view returns (bytes4 magicValue) {
        address recovered = ECDSA.recover(hash, signature);
        if (recovered == owner) {
            return bytes4(0x1626ba7e);
        } else {
            return bytes4(0xffffffff);
        }
    }
}
