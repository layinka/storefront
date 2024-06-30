import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';
import {parseEther} from 'ethers/lib/utils';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
	const {ethers, deployments, getNamedAccounts} = hre;
	const {deploy} = deployments;

	const {deployer, simpleERC20Beneficiary: buyer} = await getNamedAccounts();

	const storeFrontNFTReceipt = await ethers.getContract("StoreFrontNFTReceipt");

	await deploy('POSFactory', {
		from: deployer,
		args: [
			storeFrontNFTReceipt.address
			/*ticketMarket.address*/
		],
		log: true,
		autoMine: true, // speed up deployment on local network (ganache, hardhat), no effect on live networks
	});

	// const p2pContract = await ethers.getContract('P2P');

	// let tx = await p2pContract.register('Thadd Chad', 'email@email.com', [
	// 	{
	// 		appName: 'paypal',
	// 		paymentInstruction: 'email@email.com',
	// 		userName: '',
	// 		bank: '',
	// 	},
	// ]);

	// await tx.wait();

	// // let tx2 = await p2pContract.sellToken(
	// // 	'0x0000000000000000000000000000000000000000',
	// // 	ethers.utils.parseEther('1'),
	// // 	ethers.utils.parseEther('125000'),
	// // 	1,
	// // 	{value: ethers.utils.parseEther('1')}
	// // );

	// // await tx2.wait();

	// // tx2 = await p2pContract.sellToken(
	// // 	'0x0000000000000000000000000000000000000000',
	// // 	ethers.utils.parseEther('1'),
	// // 	ethers.utils.parseEther('125000'),
	// // 	0,
	// // 	{value: ethers.utils.parseEther('1')}
	// // );

	// // await tx2.wait();

	// // tx2 = await p2pContract
	// // 	.connect(await ethers.getSigner(buyer))
	// // 	.buyToken(1, ethers.utils.parseEther('0.5'), 'name', 'paypal', {value: 0});

	// // await tx2.wait();
};
export default func;
func.tags = ['POS'];
func.dependencies = ['tokens'];
