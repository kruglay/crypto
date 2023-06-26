import { ethers } from "hardhat";

//npx hardhat run scripts/deploy.ts --network polygon_mumbai
async function main() {
  const dataTypesDemoFactory = await ethers.getContractFactory("DataTypesDemo");
  const dataTypesDemo = await dataTypesDemoFactory.deploy();

  dataTypesDemo.deployed();
  console.log(`Data Type Demo address ${dataTypesDemo.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
