import {task} from 'hardhat/config'
import {MyToken__factory} from '../src/types/factories';
import {EventLog, Log} from 'ethers';


task('transfer', 'Transfer tokens from sender to the address')
    .addParam('contract', 'MyContract address')
    .addParam('recipient', 'Recipient address')
    .addParam('amount', 'Token amount')
    .setAction(async ({contract, recipient, amount}, {ethers}) => {
        // const {ethers} = env;
        const eth = ethers.parseEther('1');
        const [owner, user1] = await ethers.getSigners()
        const myToken = MyToken__factory.connect(contract, owner)

        const tx = await myToken.transfer(recipient, BigInt(amount) * eth)
        const txReceipt = await tx.wait();

        const log: EventLog | undefined = txReceipt?.logs.find<EventLog>((log): log is EventLog => (log as EventLog).eventName === 'Transfer');

        const balance = await myToken.balanceOf(recipient);

        console.log('Sender: ', log?.args[0]);
        console.log('Recipient: ', log?.args[1]);
        console.log('Amount: ', log?.args[2]);
        console.log(`Balance: `, balance);
    })
