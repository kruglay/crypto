import {task} from "hardhat/config";

task("verifyContract", "Verify contract")
.setAction(async ({contract}, {run}) => {
  const rewardToken = "0x0e437D7f1141CbBfd76353F22aA15c9fF189764A", 
  stakingToken = "0xBA64F30207011D1a0cf61c5CB95beC42D104d5E9",
  farmingContract = "0x11026B38537aB10885067b646FeB8C1028E63895";
  console.log('RewardToken: verification...');
  await run("verify:verify", {
    address: rewardToken,
    contract: 'contracts/RewardToken.sol:RewardToken'
  });
  console.log('RewardToken: verification success!');

  console.log('StakingToken: verification...');
  await run("verify:verify", {
    address: stakingToken,
    contract: 'contracts/StakingToken.sol:StakingToken'
  });
  console.log('RewardToken: verification success!');

  console.log('FarmingContract: verification...');
  await run("verify:verify", {
    address: farmingContract,
    constructorArguments: [stakingToken, rewardToken]
  });
  console.log('FarmingContract: verification success!');  
})