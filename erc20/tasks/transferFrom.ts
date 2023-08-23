import {task} from 'hardhat/config'
import {MyToken__factory} from '../src/types/factories';
import {EventLog} from 'ethers';


task('transferFrom', 'Transfer tokens from sender to the recipient')
    .addParam('contract', 'MyContract address')
    .addParam('sender', 'Sender address')
    .addParam('recipient', 'Recipient address')
    .addParam('amount', 'Token amount')
    .setAction(async ({contract, recipient, amount, sender}, {ethers}) => {
        const eth = ethers.parseEther('1');
        const _amount = BigInt(amount) * eth;
        const owner = await ethers.getSigner(sender);
        const myToken = MyToken__factory.connect(contract, owner)
        
        let tx = await myToken.approve(recipient, _amount);
        let txReceipt = await tx.wait();        
        tx = await myToken.transferFrom(sender, recipient, _amount);
        txReceipt = await tx.wait();

        const log: EventLog | undefined = txReceipt?.logs.find<EventLog>((log): log is EventLog => (log as EventLog).eventName === 'Transfer');

        const balance = await myToken.balanceOf(recipient);

        console.log('Sender: ', log?.args[0]);
        console.log('Recipient: ', log?.args[1]);
        console.log('Amount: ', log?.args[2]);
        console.log('Balance: ', balance);
    })
