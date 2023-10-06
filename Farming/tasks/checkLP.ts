import {task} from "hardhat/config";

task('checkLP', 'Check LP token')
  .addParam('contract')
  .setAction(async ({contract}, {ethers}) => {
    if (ethers.isAddress(contract)) {
      const code = await ethers.provider.getCode(contract);
      if (code && code !== "0x") {
        console.log(`${contract} is existed contract address on the network.`);
      } else {
        console.log(`${contract} is not a contract address. It might be an EOA or an unused address.`);
      }
    } else {
      console.log(`${contract} is not a valid Etherium address.`);
    }    
  })