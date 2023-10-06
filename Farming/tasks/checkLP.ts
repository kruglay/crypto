import {task} from "hardhat/config";

task('checkLP', 'Check LP token')
  .setAction(async (_, {ethers}) => {
    const contract = "0x560cF55e1C7337dd9A4bCaDaf0675C0c7b4eB784";
    if (ethers.isAddress(contract)) {
      const code = await ethers.provider.getCode(contract);
      if (code && code !== "0x") {
        console.log(`${contract} is existed on the network.`);
        const token = await ethers.getContractAt('IERC20', contract);
        const balance = await token.balanceOf("0x5f5928E1aa54e9909C7aB885F91d2cC23355925c");
        console.log('Balance of 0x5f5928E1aa54e9909C7aB885F91d2cC23355925c is ', balance);
      } else {
        console.log(`${contract} is not a contract address. It might be an EOA or an unused address.`);
      }
    } else {
      console.log(`${contract} is not a valid Etherium address.`);
    }    
  });