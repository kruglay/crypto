import {ethers, network, run} from "hardhat";
import {Farming__factory, RewardToken__factory, StakingToken__factory} from "../typechain-types";

async function main() {
  const [owner, user0] = await ethers.getSigners();

  console.log(await ethers.provider.getBalance(user0));
  console.log(await ethers.provider.getBalance(owner));

  if (['localhost', 'hardhat'].includes(network.name)) {
    // Define the recipient address and amount
    const recipient = owner.address;
    const amount = ethers.parseEther("1000"); // Sending 1000 ETH

    // Send the transaction
    const tx = await user0.sendTransaction({
      to: recipient,
      value: amount
    });

    await tx.wait();
  }

  const rewardFactory = new RewardToken__factory(owner);
  const RewardToken = await rewardFactory.deploy();

  const stakingFactory = new StakingToken__factory(owner);
  const StakingToken = await stakingFactory.deploy();

  console.log('RewardToken: waiting for deployment...');
  await RewardToken.waitForDeployment();
  console.log('RewardToken: deployed ', RewardToken.target);

  console.log('StakingToken: waiting for deployment...');
  await StakingToken.waitForDeployment();
  console.log('StakingToken: deployed ', StakingToken.target);

  const FarmingContract = await (new Farming__factory(owner)).deploy(StakingToken.target, RewardToken.target);
  console.log('FarmingContract: waiting for deployment...');
  await FarmingContract.waitForDeployment();
  console.log('FarmingContract: deployed ', FarmingContract.target);

  if (!['localhost', 'hardhat'].includes(network.name)) {
    console.log('RewardToken: verification...');
    await run("verify:verify", {
      address: RewardToken.target,
      contract: 'contracts/RewardToken.sol:RewardToken'
    });
    console.log('RewardToken: verification success!');

    console.log('StakingToken: verification...');
    await run("verify:verify", {
      address: StakingToken.target,
      contract: 'contracts/StakingToken.sol:StakingToken'
    });
    console.log('RewardToken: verification success!');

    console.log('FarmingContract: verification...');
    await run("verify:verify", {
      address: FarmingContract.target,
      constructorArguments: [StakingToken.target, RewardToken.target]
    });
    console.log('FarmingContract: verification success!');
  }
};

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
