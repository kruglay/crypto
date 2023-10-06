import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import {ethers} from 'hardhat';
import {expect} from 'chai';
import {Farming, Farming__factory, RewardToken__factory, StakingToken__factory} from '../typechain-types';
import {HardhatEthersSigner} from "@nomicfoundation/hardhat-ethers/signers";

describe('Farming contract', async () => {
  const decimal = BigInt(10 ** 18);
  const amount = 1000n * decimal;
  const rewardAmount = amount * 1000n * 3n / 10000n;
  const startTime = Math.floor(Number(new Date()) / 1000);


  async function deployFixture() {
    const [owner, user1, user2, user3] = await ethers.getSigners();

    const RewardToken = await (new RewardToken__factory(user3)).deploy();
    const StakingToken = await (new StakingToken__factory(user3)).deploy();

    await RewardToken.waitForDeployment();
    await StakingToken.waitForDeployment();

    const FarmingContract = await (new Farming__factory(owner)).deploy(StakingToken.target, RewardToken.target);

    await FarmingContract.waitForDeployment();

    await StakingToken.mint(user2, 2n * amount);
    await RewardToken.mint(owner, amount);
    await StakingToken.connect(user2).approve(FarmingContract.target, 2n * amount);
    await RewardToken.connect(owner).approve(FarmingContract, amount * 1000n * 3n / 10000n);

    return {owner, user1, user2, user3, RewardToken, StakingToken, FarmingContract}
  }

  function claimFixture(FarmingContract: Farming, user2: HardhatEthersSigner) {
    return async function claimFixture() {
      let tx = await FarmingContract.initialize(amount, 1000, 30, 3, startTime);
      let txRcpt = await tx.wait();

      await FarmingContract.connect(user2).deposit(amount);
      await ethers.provider.send("evm_increaseTime", [time.duration.days(30) * 3 + 1000]);

      FarmingContract.connect(user2).claimRewards();
    }
  }

  it('Should initialized by owner', async () => {
    const {owner, user1, user2, user3, RewardToken, StakingToken, FarmingContract} = await loadFixture(deployFixture);

    await expect(FarmingContract.connect(user1).initialize(amount, 1000, 30, 3, Number(new Date()))).to.be.revertedWith('Not an owner');
  });

  it('Should be not initialized', async () => {
    const {owner, user1, user2, user3, RewardToken, StakingToken, FarmingContract} = await loadFixture(deployFixture);

    await FarmingContract.initialize(amount - 1000n, 1000, 30, 3, Number(new Date()));
    await expect(FarmingContract.initialize(1000n, 1000, 30, 3, Number(new Date()))).to.be.revertedWith('Already initialized');
  });

  it('Should be enough allowance', async () => {
    const {owner, user1, user2, user3, RewardToken, StakingToken, FarmingContract} = await loadFixture(deployFixture);

    await expect(FarmingContract.initialize(amount + 9n, 1000, 30, 3, Number(new Date()))).to.be.revertedWith('Insufficient allowance for Farming contract.');
  });

  it('Should be initialized, with params, transfer rewardTokens from owner to contract', async () => {
    const {owner, user1, user2, user3, RewardToken, StakingToken, FarmingContract} = await loadFixture(deployFixture);

    const balanceBeforeOwner = await RewardToken.balanceOf(owner);

    const balanceBeforeContract = await RewardToken.balanceOf(FarmingContract);

    await FarmingContract.initialize(amount, 1000, 30, 3, startTime);

    expect(await FarmingContract.initialized()).to.be.true;
    expect(await FarmingContract.tokensLeft()).to.eql(amount);
    expect(await FarmingContract.percentage()).to.eql(1000n);
    expect(await FarmingContract.startTime()).to.eql(BigInt(startTime));
    expect(await FarmingContract.amountOfEpochs()).to.eql(3n);
    expect(await FarmingContract.epochDuration()).to.eql(BigInt(time.duration.days(30)));
    expect(await RewardToken.balanceOf(owner)).to.eql(balanceBeforeOwner - rewardAmount);
    expect(await RewardToken.balanceOf(FarmingContract)).to.eql(balanceBeforeContract + rewardAmount);

  });

  it('Should farming started', async () => {
    const {owner, user1, user2, user3, RewardToken, StakingToken, FarmingContract} = await loadFixture(deployFixture);

    await expect(FarmingContract.connect(user1).deposit(1n)).to.be.revertedWith("Farming is not up yet!");
  });

  // todo нужно ли делать проверку на ошибки ERC20?
  // it('Should enough stakingToken allowance and balance',async () => {
  //   const {owner, user1, user2, user3, RewardToken, StakingToken, FarmingContract} = await loadFixture(deployFixture);

  //   await expect(FarmingContract.connect(user2).deposit(1n)).to.be.revertedWith("Farming is not up yet!");    
  // })

  it('Should deposit not more than tokensLeft', async () => {
    const {owner, user1, user2, user3, RewardToken, StakingToken, FarmingContract} = await loadFixture(deployFixture);

    const tx = await FarmingContract.initialize(amount, 1000, 30, 3, startTime - 1000)
    const txRcpt = await tx.wait();

    await expect(FarmingContract.connect(user2).deposit(amount + 1n)).to.be.revertedWith("Too many tokens contributed");
  });

  it('Should transfer stakingTokens from sender to contract, add user with params, reduce tokensLeft', async () => {
    const {owner, user1, user2, user3, RewardToken, StakingToken, FarmingContract} = await loadFixture(deployFixture);

    let tx = await FarmingContract.initialize(amount, 1000, 30, 3, startTime - 1000)
    let txRcpt = await tx.wait();

    const balanceBeforeUser = await StakingToken.balanceOf(user2);
    const balanceBeforeContract = await StakingToken.balanceOf(FarmingContract);

    tx = await FarmingContract.connect(user2).deposit(amount);
    txRcpt = await tx.wait();

    expect(await StakingToken.balanceOf(user2)).to.eql(balanceBeforeUser - amount);
    expect(await StakingToken.balanceOf(FarmingContract)).to.eql(balanceBeforeContract + amount);

    const user = await FarmingContract.users(user2.address);
    const userForCompare = [amount, BigInt((await txRcpt?.getBlock()!).timestamp), false];

    expect(user).to.be.eql(userForCompare);
  });

  it('Should deposited only once, deposit more than 0', async () => {
    const {owner, user1, user2, user3, RewardToken, StakingToken, FarmingContract} = await loadFixture(deployFixture);

    const tx = await FarmingContract.initialize(amount, 1000, 30, 3, startTime - 1000)
    const txRcpt = await tx.wait();

    await expect(FarmingContract.connect(user2).deposit(0)).to.be.revertedWith("Have to deposit more than 0!");
    await FarmingContract.connect(user2).deposit(amount - 1000n);
    await expect(FarmingContract.connect(user2).deposit(1n)).to.be.revertedWith("Already deposited!");
  });

  it('Should emit Deposited event', async () => {
    const {owner, user1, user2, user3, RewardToken, StakingToken, FarmingContract} = await loadFixture(deployFixture);

    const tx = await FarmingContract.initialize(amount, 1000, 30, 3, startTime - 1000)
    const txRcpt = await tx.wait();

    await expect(FarmingContract.connect(user2).deposit(amount - 1000n)).to.emit(FarmingContract, 'Deposited').withArgs(user2.address, amount - 1000n);
  });

  it('Should pass enough time before claiming rewards', async () => {
    const {owner, user1, user2, user3, RewardToken, StakingToken, FarmingContract} = await loadFixture(deployFixture);

    const tx = await FarmingContract.initialize(amount, 1000, 30, 3, startTime);
    const txRcpt = await tx.wait();

    await FarmingContract.connect(user2).deposit(amount);
    await expect(FarmingContract.connect(user2).claimRewards()).to.be.revertedWith('You have to wait more time before claim rewards');
  });

  it('Should trasnfer rewards from contract to user, claimed is true', async () => {
    const {owner, user1, user2, user3, RewardToken, StakingToken, FarmingContract} = await loadFixture(deployFixture);

    let tx = await FarmingContract.initialize(amount, 1000, 30, 3, startTime);
    let txRcpt = await tx.wait();

    const balanceBeforeUser = await RewardToken.balanceOf(user2);
    const balanceBeforeContract = await RewardToken.balanceOf(FarmingContract);

    await FarmingContract.connect(user2).deposit(amount);
    await ethers.provider.send("evm_increaseTime", [time.duration.days(30) * 3 + 1000]);

    await FarmingContract.connect(user2).claimRewards();

    expect(await RewardToken.balanceOf(user2)).to.eql(balanceBeforeUser + rewardAmount);
    expect(await RewardToken.balanceOf(FarmingContract)).to.eql(balanceBeforeContract - rewardAmount);

    expect((await FarmingContract.users(user2)).claimed).to.be.true;
  });

  it('Should emit Claimed event', async () => {
    const {owner, user1, user2, user3, RewardToken, StakingToken, FarmingContract} = await loadFixture(deployFixture);
    let tx = await FarmingContract.initialize(amount, 1000, 30, 3, startTime);
    let txRcpt = await tx.wait();

    await FarmingContract.connect(user2).deposit(amount);
    await ethers.provider.send("evm_increaseTime", [time.duration.days(30) * 3 + 1000]);

    await expect(FarmingContract.connect(user2).claimRewards()).to.emit(FarmingContract, 'Claimed').withArgs(user2.address, rewardAmount);
  });

  it('Should withdraw after claiming rewards', async () => {
    const {owner, user1, user2, user3, RewardToken, StakingToken, FarmingContract} = await loadFixture(deployFixture);
    
    await expect(FarmingContract.connect(user2).withdraw()).to.be.revertedWith('Claim rewards first');
  });

  it('Should transfer stakingToken from contract to user', async () => {
    const {owner, user1, user2, user3, RewardToken, StakingToken, FarmingContract} = await loadFixture(deployFixture);
    await loadFixture(claimFixture(FarmingContract, user2));
    
    const balanceBeforeUser = await StakingToken.balanceOf(user2);
    const balanceBeforeContract = await StakingToken.balanceOf(FarmingContract);

    await FarmingContract.connect(user2).withdraw();

    expect(await StakingToken.balanceOf(user2)).to.be.eql(balanceBeforeUser + amount);
    expect(await StakingToken.balanceOf(FarmingContract)).to.be.eql(balanceBeforeContract - amount);
  });

  it('Should emit Withdraw event', async () => {
    const {owner, user1, user2, user3, RewardToken, StakingToken, FarmingContract} = await loadFixture(deployFixture);
    await loadFixture(claimFixture(FarmingContract, user2));
    
    await expect(FarmingContract.connect(user2).withdraw()).to.emit(FarmingContract, 'Withdraw').withArgs(user2.address);
  });

})