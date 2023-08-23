import {loadFixture} from "@nomicfoundation/hardhat-toolbox/network-helpers"
import {ethers} from 'hardhat'
import {expect} from "chai";

import {IERC20__factory, MyToken, MyToken__factory} from '../src/types'
import {it} from "mocha";

const NAME = "MyToken";
const SYMBOL = "MTK";

describe("MyToken contract", function () {
  const eth = ethers.parseEther('1');

  async function deployFixture() {
    const [owner, user1, user2, ...users] = await ethers.getSigners();
    const factory = await ethers.getContractFactory("MyToken");
    const myToken: MyToken = await factory.deploy(NAME, SYMBOL);

    await myToken.waitForDeployment();

    return {owner, myToken, user1, user2, users};
  }

  describe("Initial params of contract", async () => {

    it("Should assign the total supply of tokens to the owner", async function () {
      const {myToken, owner} = await loadFixture(deployFixture);

      let ownerBalance: BigInt = await myToken.balanceOf(owner.address);
      const totalSupply: BigInt = await myToken.totalSupply();
      expect(totalSupply).to.equal(ownerBalance);
    });

    it(`Should "name" of contract be equal "MyToken"`, async function () {
      const {myToken, owner} = await loadFixture(deployFixture);

      expect(await myToken.name()).to.equal(NAME);
    });

    it(`Should "symbol" of contract be equal "MTK"`, async function () {
      const {myToken, owner} = await loadFixture(deployFixture);

      expect(await myToken.symbol()).to.equal(SYMBOL);
    });

  })

  describe("Contract logic", async function () {

    it("Should mint only owner", async function () {
      const {myToken, owner, user1} = await loadFixture(deployFixture);

      await expect(myToken.connect(user1).mint(user1, 111)).to.be.revertedWith("MyToken: you are not an owner");
    })

    it("mint should emit Transfer", async function () {
      const {myToken, owner, user1} = await loadFixture(deployFixture);

      await expect(myToken.mint(user1, 100)).to.emit(myToken, 'Transfer').withArgs(ethers.ZeroAddress, user1.address, 100);
    })

    it("Mint should raise recipient balance, and raise totalSupply", async function () {
      const {myToken, owner, user1} = await loadFixture(deployFixture);

      const amount = 100n;
      const totalSupplyBefore = await myToken.totalSupply();
      await myToken.mint(user1.address, amount);
      const totalSupplyAfter = await myToken.totalSupply();
      const userBalance = await myToken.balanceOf(user1);

      expect(totalSupplyAfter).to.eq(totalSupplyBefore + amount);
      expect(userBalance).to.eq(amount);
    })

    it("Should show balance of address", async function () {
      const {myToken, owner, user1} = await loadFixture(deployFixture);

      const userBalance = await myToken.balanceOf(user1.address);

      expect(userBalance).to.eq(0n);
    })

    it("Shouldn't transfer more than current balance",async function() {
      const {myToken, owner, user1, user2} = await loadFixture(deployFixture);

      await expect(myToken.connect(user1).transfer(user2, 1)).to.revertedWith("MyToken: Not enough balance");
    })

    it("transfer should emit 'Transfer' event",async function() {
      const {myToken, owner, user1, user2} = await loadFixture(deployFixture);

      await expect(myToken.transfer(user2, 1)).to.emit(myToken, 'Transfer').withArgs(owner.address, user2.address, 1);
    })

    it("Should transfer funds",async function() {
      const {myToken, owner, user1, user2} = await loadFixture(deployFixture);

      const userBalanceBefore = await myToken.balanceOf(user1);
      const ownerBalanceBefore = await myToken.balanceOf(owner);

      const amount = ethers.parseEther('1');
      await myToken.transfer(user1, amount);

      expect(await myToken.balanceOf(user1)).to.be.eq(userBalanceBefore + amount);
      expect(await myToken.balanceOf(owner)).to.be.eq(ownerBalanceBefore - amount);
    })

    it("Should set allowance for user",async function() {
      const {myToken, owner, user1, user2} = await loadFixture(deployFixture);

      const amount = 2n * eth

      await myToken.connect(user1).approve(user2, amount);

      expect(await myToken.allowance(user1, user2)).to.eq(amount);
    })

    it("Shouldn't transferFrom more than current balance",async function() {
      const {myToken, owner, user1, user2} = await loadFixture(deployFixture);

      await expect(myToken.connect(user1).transferFrom(user1, user2, 1)).to.revertedWith("MyToken: Insufficient balance");
    })

    it('Should set allowance for user, emit "Transfer" event', async () => {
      const {myToken, owner, user1, user2} = await loadFixture(deployFixture);

      const tx = myToken.approve(user1, 100n);

      await expect(tx).to.emit(myToken, 'Approval').withArgs(owner.address, user1.address, 100n);
      expect(await myToken.allowance(owner, user1)).to.eql(100n);      
    })

    it("Shouldn't transferFrom more than allowance",async function() {
      const {myToken, owner, user1, user2} = await loadFixture(deployFixture);
      const amount = 2n * eth;

      await myToken.connect(user1).approve(user2, amount);
      await myToken.mint(user1, 2n * amount);

      await expect(myToken.transferFrom(user1, user2, amount + 1n)).to.revertedWith("MyToken: Insufficient allowance");
    })

    it("Should reduce allowance and raise balance for recipient and reduce balance for sender, emit 'Transfer' event",async function() {
      const {myToken, owner, user1, user2} = await loadFixture(deployFixture);
      const amount = 2n * eth;
      const transfer =  amount * 3n / 10n;
      const leftAmount = amount - transfer;

      await myToken.connect(user1).approve(user2, amount);
      await myToken.mint(user1, amount);

      const tx = myToken.transferFrom(user1, user2, transfer);

      await expect(tx).to.emit(myToken, 'Transfer').withArgs(user1.address, user2.address, transfer);
      
      expect(await myToken.allowance(user1, user2)).to.eq(leftAmount);
      expect(await myToken.balanceOf(user2)).to.eq(transfer);
      expect(await myToken.balanceOf(user1)).to.eq(leftAmount);
    })

    it("Should burn only owner", async function () {
      const {myToken, owner, user1} = await loadFixture(deployFixture);

      await expect(myToken.connect(user1).burn(user1, 111)).to.be.revertedWith("MyToken: you are not an owner");
    })

    it("Shouldn't burn more than current balance",async function() {
      const {myToken, owner, user1} = await loadFixture(deployFixture);

      await expect(myToken.burn(user1, 1n)).to.revertedWith("MyToken: Insufficient balance");
    })

    it("Should reduce user balance and totalSupply, emit 'Transfer' event", async function() {
      const {myToken, owner, user1} = await loadFixture(deployFixture);
      const mintAmount = eth;
      const burnAmount = eth / 5n;

      await myToken.mint(user1, mintAmount);
      const totalSupply = await myToken.totalSupply();
      const tx = myToken.burn(user1, burnAmount);      

      await expect(tx).to.emit(myToken, 'Transfer').withArgs(user1.address, ethers.ZeroAddress, burnAmount);

      expect(await myToken.totalSupply()).to.eql(totalSupply - burnAmount);
      expect(await myToken.balanceOf(user1)).to.eql(mintAmount - burnAmount);
    })
  })
});