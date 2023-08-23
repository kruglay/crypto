import {task} from 'hardhat/config'
import {ContractTransactionResponse, EventLog} from "ethers";
import {Address} from 'cluster';
import {MyToken__factory} from '../src/types';

task('mint', 'Mint tokens to the address')
    .addParam('token', 'Token address')
    .addParam('user', 'Resiver user address')
    .addParam('amount', 'Token amount')
    .setAction(async ({token, user, amount}, {ethers}) => {
        const [owner, user1] = await ethers.getSigners()
        const tokenContract = MyToken__factory.connect(token, owner)

        // event listener from https://stackoverflow.com/questions/68432609/contract-event-listener-is-not-firing-when-running-hardhat-tests-with-ethers-js
        const contractTx: ContractTransactionResponse = await tokenContract.mint(user, amount);
        const contractReceipt = await contractTx.wait();
        const event: EventLog | undefined = contractReceipt?.logs.find<EventLog>((log): log is EventLog => (log as EventLog).eventName === 'Transfer');
        const eInitiator: Address = event?.args!['from'];
        const eRecipient: Address = event?.args!['to'];
        const eAmount = event?.args!['value'];
        console.log(`Initiator: ${eInitiator}`)
        console.log(`Recipient: ${eRecipient}`)
        console.log(`Amount: ${eAmount}`)
    })
