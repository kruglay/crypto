import {task} from "hardhat/config";

task('initialize', 'Initialize')
.addParam('contract')
.setAction(async ({contract}, {ethers}) => {
  const decimal = BigInt(10 ** 18);
  const amount = 1000n * decimal;
  const rewardAmount = amount * 1000n * 3n / 10000n; 
  const startTime = Math.floor(Number(new Date()) / 1000);

  const FarmingContract = await ethers.getContractAt('Farming', contract);  

  const rewardTokenAddress = await FarmingContract.rewardToken();
  const RewardToken = await ethers.getContractAt('RewardToken', rewardTokenAddress);

  console.log('Initializing...');
  let tx = await RewardToken.approve(FarmingContract, rewardAmount);
  let txRcpt = await tx.wait();
  tx = await FarmingContract.initialize(amount, 1000, 30, 3, startTime);
  txRcpt = await tx.wait();
  console.log('Initialized');
})