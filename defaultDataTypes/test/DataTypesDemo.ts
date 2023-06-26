import { expect } from "chai";
import { ethers } from "hardhat";
import { DataTypesDemo } from "../typechain-types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

describe("Data Types Demo", function () {
  let dataTypesDemo: DataTypesDemo;
  let owner: SignerWithAddress, user1: SignerWithAddress, user2: SignerWithAddress, users:SignerWithAddress[];

  beforeEach(async ()=> {
    [owner, user1, user2, ...users] = await ethers.getSigners();
    const dataTypesDemoFactory = await ethers.getContractFactory("DataTypesDemo");
    dataTypesDemo = await dataTypesDemoFactory.deploy();
  });

  describe("Initial statement", async () => { 
    it("Should return owner address", async() => {
        console.log(`address ${await dataTypesDemo.myImmutableAddress()}`);
        expect(await dataTypesDemo.myImmutableAddress()).to.be.equal(owner.address);
    });

    it("Should return myUintConstant 101", async () => {
        expect(await dataTypesDemo.myUintConstant()).to.be.equal(101);
    });
  });
  describe("Check functionality", async () => {
    it("Set new status", async () => {
        await dataTypesDemo.setMyStatus(1);
        expect(await dataTypesDemo.myStatus()).to.be.equal(1);
    });

    it("Deposit", async () => {
        await dataTypesDemo.deposit({value: "100000000000"});
        expect(await ethers.provider.getBalance(dataTypesDemo.address)).to.be.equal("100000000000");
    });

    it("Fallback", async () => {
        let tx = {
            to: dataTypesDemo.address,
            data: "0xa9059cbb000000000000000000000000ececa1dab1fa867192ba95424b49139cd0c148e4000000000000000000000000000000000000000000000000000000000bebc200"
        }

        const transactionRecipient = await user1.sendTransaction(tx);
        const transactionResponse = transactionRecipient.wait();

        const events = await dataTypesDemo.queryFilter(dataTypesDemo.filters.FallbackCalled(), transactionRecipient.blockNumber);
        console.log(events);

        expect(events.length).to.be.equal(1);
    });

    it("Recieve", async () => {
        let tx = {
            to: dataTypesDemo.address,
            value: ethers.utils.parseEther("5")
        }

        const transactionRecipient = await user1.sendTransaction(tx);
        const transactionResponse = transactionRecipient.wait();

        const events = await dataTypesDemo.queryFilter(dataTypesDemo.filters.ReceiveCalled(), transactionRecipient.blockNumber);
        console.log(events);

        expect(events.length).to.be.equal(1);
    });
  });
});
