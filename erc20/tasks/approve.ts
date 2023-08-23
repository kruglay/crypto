import {task} from 'hardhat/config'
import {MyToken__factory} from '../src/types/factories';
import {EventLog, Log} from 'ethers';


task('approve', 'Give allowance to spent tokens for spender')
    .addParam('contract', 'MyContract address')
    .addParam('spender', 'Spender address')
    .addParam('amount', 'Tokens amount')
    .setAction(async ({contract, spender, amount}, {ethers}) => {
        const eth = ethers.parseEther('1');
        const [owner, user1] = await ethers.getSigners()
        const myToken = MyToken__factory.connect(contract, owner)

        const tx = await myToken.approve(spender, BigInt(amount) * eth);
        const txReceipt = await tx.wait();

        const log: EventLog | undefined = txReceipt?.logs.find<EventLog>((log): log is EventLog => (log as EventLog).eventName === 'Approval');

        const allowance = await myToken.allowance(owner.address, spender);

        console.log('Sender: ', log?.args[0]);
        console.log('Spender: ', log?.args[1]);
        console.log('Amount: ', log?.args[2]);
        console.log('Allowance: ', allowance);
    })
