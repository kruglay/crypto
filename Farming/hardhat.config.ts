import {config as dotenvConfig} from "dotenv";
import {resolve} from "path";

import {HardhatUserConfig} from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

import "./tasks/initialize";
import "./tasks/checkLP";
import "./tasks/verifyContract";

const dotenvConfigPath: string = process.env.DOTENV_CONFIG_PATH || "./.env";
dotenvConfig({path: resolve(__dirname, dotenvConfigPath)});

console.log("mnemonic", process.env.MNEMONIC || "");

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545",
      blockGasLimit: 30000000,
      gas: 30000000,
      hardfork: 'istanbul',
      accounts: [
        process.env.PRIVATE_KEY || "", "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
      ],
    },
    polygonMumbai: {
      url: "https://rpc-mumbai.maticvigil.com",
      chainId: 80001,
      accounts: {
        count: 10,
        mnemonic: process.env.MNEMONIC || "",
      },
    },
    forked: {
      url: "https://goerli.infura.io/v3/" + process.env.INFURA_API_KEY || "",
      forking: {
        url: "https://goerli.infura.io/v3/" + process.env.INFURA_API_KEY || "",
      }
    }
  },
  etherscan: {
    apiKey: {
      polygonMumbai: process.env.POLYGONSCAN_API_KEY || ""
    }
  }
};

export default config;
