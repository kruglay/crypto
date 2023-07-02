import { task } from 'hardhat/config'
import { BigNumber, ContractTransaction, ContractReceipt } from "ethers";
import { Address } from 'cluster';

task('approve', 'Approve tokens to spender')
    .addParam('token', 'Token address')
    .addParam('spender', 'Spender user address')
    .addParam('value', 'Value to send')
	.setAction(async ({ token, spender, value}, { ethers }) => {
        const Token = await ethers.getContractFactory('MyToken')
        const tokenContract = Token.attach(token)


        const contractTx: ContractTransaction = await tokenContract.approve(spender, value);
        const contractReceipt: ContractReceipt = await contractTx.wait();
        const event = contractReceipt.events?.find(event => event.event === 'Approval');
        const eOwner: Address = event?.args!['owner'];
        const eSpender: Address = event?.args!['spender'];
        const eValue: BigNumber = event?.args!['value'];            
    	console.log(`Owner: ${eOwner}`)
    	console.log(`Spender: ${eSpender}`)
    	console.log(`Value: ${eValue}`)
    })
