//SPDX-License-Identifier: Unlicense
pragma solidity =0.8.19;

import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract Farming {
    using SafeERC20 for IERC20Metadata;

    struct User {
        uint256 amount;
        uint256 depositTime;
        bool claimed;
    }

    uint256 public constant HUNDRED_PERCENT = 10_000; // 100.00%

    address public owner;

    IERC20Metadata public stakingToken; // LP token

    IERC20Metadata public rewardToken; // token A or erc20

    uint256 public tokensLeft;

    uint256 public percentage;

    uint256 public startTime;

    uint256 public epochDuration;

    uint256 public amountOfEpochs;

    bool public initialized;

    mapping (address => User) public users;

    event Deposited(address addr, uint256 amount);
    event Withdraw(address addr);
    event Claimed(address addr, uint256 amount);

    constructor(address _stakingToken, address _rewardToken) {
        owner = msg.sender;
        stakingToken = IERC20Metadata(_stakingToken);
        rewardToken = IERC20Metadata(_rewardToken);
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not an owner");
        _;
    }

    function initialize(
        uint256 _totalAmount,
        uint256 _percentage, // 0 ~ 100.00% => 0 ~ 10000
        uint256 _epochDuration,
        uint256 _amountOfEpochs,
        uint256 _startTime
    ) external onlyOwner {
        require(!initialized, "Already initialized");
        require(rewardToken.allowance(msg.sender, address(this)) >= _totalAmount * _percentage * _amountOfEpochs / HUNDRED_PERCENT, "Insufficient allowance for Farming contract."); // todo нужно ли делать тут провреку, т.к. то же самое проверяется в ERC20?
        SafeERC20.safeTransferFrom(
            rewardToken,
            msg.sender,
            address(this),
            _totalAmount * _percentage * _amountOfEpochs / HUNDRED_PERCENT
        );
        initialized = true;
        tokensLeft = _totalAmount;
        percentage = _percentage;
        startTime = _startTime;
        amountOfEpochs = _amountOfEpochs;
        epochDuration = _epochDuration * 1 days;
    }

    function deposit(uint256 _amount) external {
        require(_amount > 0, "Have to deposit more than 0!");
        require(startTime > 0 && startTime <= block.timestamp, "Farming is not up yet!");
        // require(stakingToken.allowance(msg.sender, address(this)) >= _amount, "Insufficient allowance for Farming contract."); // todo нужно ли делать тут провреку, т.к. то же самое проверяется в ERC20?
        require(_amount <= tokensLeft, "Too many tokens contributed");
        require(users[msg.sender].depositTime == 0, "Already deposited!");
        SafeERC20.safeTransferFrom(stakingToken, msg.sender, address(this), _amount);
        
        users[msg.sender] = User({
            amount: _amount,
            depositTime: block.timestamp,
            claimed: false
        });
        tokensLeft -= _amount;        
        emit Deposited(msg.sender, _amount);
    }

    // ToDo:: following functions
    function withdraw() external {
        require(users[msg.sender].claimed, "Claim rewards first");
        SafeERC20.safeTransfer(stakingToken, msg.sender, users[msg.sender].amount);
        users[msg.sender].amount = 0;

        emit Withdraw(msg.sender);
    }

    function claimRewards() external {
        require(!users[msg.sender].claimed, "User already claimed rewards");
        require(users[msg.sender].depositTime + epochDuration * amountOfEpochs <= block.timestamp, "You have to wait more time before claim rewards");        

        SafeERC20.safeTransfer(rewardToken, msg.sender, users[msg.sender].amount * percentage * amountOfEpochs / HUNDRED_PERCENT);

        users[msg.sender].claimed = true;

        emit Claimed(msg.sender, users[msg.sender].amount * percentage * amountOfEpochs / HUNDRED_PERCENT);
    }
}
