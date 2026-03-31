// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "@account-abstraction/contracts/interfaces/IPaymaster.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Paymaster is IPaymaster, Ownable {
    mapping(address => bool) public whitelistedAccounts;
    mapping(address => uint256) public dailySponsorship;
    uint256 public dailyLimit = 1 ether;
    uint256 public constant RESET_PERIOD = 24 hours;

    event AccountWhitelisted(address indexed account);
    event AccountBlacklisted(address indexed account);
    event SponsorshipPaid(address indexed account, uint256 amount);
    event EtherReceived(address indexed sender, uint256 amount);

    constructor(address _owner) Ownable(_owner) {}

    // Receive ether directly (for deposits)
    receive() external payable {
        emit EtherReceived(msg.sender, msg.value);
    }

    fallback() external payable {
        emit EtherReceived(msg.sender, msg.value);
    }

    function addToWhitelist(address _account) external onlyOwner {
        whitelistedAccounts[_account] = true;
        emit AccountWhitelisted(_account);
    }

    function removeFromWhitelist(address _account) external onlyOwner {
        whitelistedAccounts[_account] = false;
        emit AccountBlacklisted(_account);
    }

    function setDailyLimit(uint256 _limit) external onlyOwner {
        dailyLimit = _limit;
    }

    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }

    function validatePaymasterUserOp(
        UserOperation calldata userOp,
        bytes32 userOpHash,
        uint256 maxCost
    ) external override returns (bytes memory context, uint256 validationData) {
        address sender = userOp.sender;

        require(whitelistedAccounts[sender], "ACCOUNT_NOT_WHITELISTED");

        uint256 currentDaily = dailySponsorship[sender];

        require(currentDaily + maxCost <= dailyLimit, "DAILY_LIMIT_EXCEEDED");

        context = new bytes(0);
        validationData = 0;
    }

    function postOp(
        PostOpMode mode,
        bytes calldata context,
        uint256 actualGasCost
    ) external override {
        // noop for now
    }
}
