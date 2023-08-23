import {task} from 'hardhat/config'
import {MyToken__factory} from '../src/types/factories';
import {EventLog, Log} from 'ethers';


task('burn', 'Burn tokens from user')
    .addParam('contract', 'MyContract address')
    .addParam('user', 'Address for burn')
    .addParam('amount', 'Token amount')
    .setAction(async ({contract, user, amount}, {ethers}) => {
        const eth = ethers.parseEther('1');
        const _amount = BigInt(amount) * eth;
        const [owner] = await ethers.getSigners()
        const myToken = MyToken__factory.connect(contract, owner)

        const tx = await myToken.burn(user, _amount)
        const txReceipt = await tx.wait();

        const log: EventLog | undefined = txReceipt?.logs.find<EventLog>((log): log is EventLog => (log as EventLog).eventName === 'Transfer');

        const balance = await myToken.balanceOf(user);

        console.log('User: ', log?.args[0]);
        console.log('Amount: ', log?.args[2]);
        console.log(`Balance: `, balance);
    })
