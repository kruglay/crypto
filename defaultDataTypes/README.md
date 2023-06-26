# DataTypesDemo

Get test coins from [faucet](https://faucet.polygon.technology/)

Try running some of the following tasks:

```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
```

## Installation

Install the dependencies using the following command:
```
npm i
```

## Deployment

Fill in all the required environment variables(copy .env-example to .env and fill it). 

Deploy contract to the chain (mumbai testnet):
```
npx hardhat run scripts/deploy.ts --network polygon_mumbai
```

## Tasks

Create new task(s) ans save it(them) in the folder "tasks". Add a new task name in the file "tasks/index.ts".

Running a task:
```
npx hardhat setBasicDataTypes --contract {CONTRACT_ADDRESS} --myuint {MY_UINT} --myint {MY_INT} --mybool {MY_BOOL} --myaddress {MY_ADDRESS} --mystring {MY_STRING} --network polygon_mumbai
```
Note: Replace all {...} with appropriate variables.

Example: npx hardhat setBasicDataTypes --contract 0x96f1e2CA249Ec213764A124988164308D7E7650a --myuint 12300000000000000000 --myint 321 --mybool true --myaddress 0xBDb003DC700DC8578a2e2F3A05E0f4a25Ca42f59 --mystring "Hello World!" --network polygon_mumbai

## Verification

Verify the installation by running the following command:
```
npx hardhat verify --network polygon_mumbai {CONTRACT_ADDRESS}
```
Note: Replace {CONTRACT_ADDRESS} with the address of the contract.