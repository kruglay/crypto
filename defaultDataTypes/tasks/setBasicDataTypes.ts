import { task } from 'hardhat/config'
import { BigNumber, ContractTransaction, ContractReceipt } from "ethers";
import { Address } from 'cluster';

task('setBasicDataTypes', 'Set basic types')
    .addParam('contract', 'contract address')
    .addParam('myuint', '_myUint')
    .addParam('myint', '_myInt')
    .addParam('mybool', '_myBool')
    .addParam('myaddress', '_myAddress')
    .addParam('mystring', '_myString')
	.setAction(async ({ contract, myuint, myint, mybool, myaddress, mystring}, { ethers }) => {
        const dataTypesDemoFactory = await ethers.getContractFactory("DataTypesDemo");
        const dataTypesDemo = await dataTypesDemoFactory.attach(contract);

        const contractTx: ContractTransaction = await dataTypesDemo.setBasicDataTypes(
            myuint,
            myint,
            mybool,
            myaddress,
            mystring
        );

        const contractReceipt: ContractReceipt = await contractTx.wait();
        const event = contractReceipt.events?.find(event => event.event === "ChangedBasicData");
        const myUint: BigNumber = event?.args!['myUint'];
        const myInt: Number = event?.args!['myInt'];
        const myBool: Boolean = event?.args!['myBool'];
        const myAddress: Address = event?.args!['myAddress'];
        const myString: String = event?.args!['myString'];

        console.log(`myUint ${myUint}`);
        console.log(`myInt ${myInt}`);
        console.log(`myBool ${myBool}`);
        console.log(`myAddress ${myAddress}`);
        console.log(`myString ${myString}`);
    });
