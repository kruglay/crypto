import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomiclabs/hardhat-ethers";

require("dotenv").config();
//tasks
require('./tasks')

const COMPILER_SETTINGS = {
  optimizer: {
    enabled: true,
    runs: 200,
  },
  metadata: {
    bytecodeHash: "none",
  },
};

if (!process.env.MNEMONIC)
  throw new Error("Please set your MNEMONIC in a .env file");
let mnemonic = process.env.MNEMONIC as string;

if (!process.env.MNEMONIC)
  throw new Error("Please set your RPC_URL in a .env file");
let rpcUrl = process.env.RPC_URL as string;

if (!process.env.MUMBAISCAN_API_KEY)
  throw new Error("Please set your MUMBAISCAN_API_KEY in a .env file");
let mumbaiScanApiKey = process.env.MUMBAISCAN_API_KEY as string;

const config: HardhatUserConfig = {
  networks: {
    hardhat: {
      accounts: {
        accountsBalance: "10000000000000000000000000",
      },
    },
    polygon_mumbai: {
      url: rpcUrl,
      accounts: {
        count: 10,
        initialIndex: 0,
        mnemonic,
        path: "m/44'/60'/0'/0",
      },
    },
  },
  etherscan: {
    apiKey: mumbaiScanApiKey,
  },
  solidity: {
    compilers: [
      {
        version: "0.8.19",
        COMPILER_SETTINGS,
      },
      {
        version: "0.8.17",
        COMPILER_SETTINGS,
      }
    ],
  },
};

export default config;
