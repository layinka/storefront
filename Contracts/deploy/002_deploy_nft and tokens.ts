import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';
import {parseEther} from 'ethers/lib/utils';
import {readFileSync, writeFileSync} from 'fs';
import {join} from 'path';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
	const {ethers, deployments, getNamedAccounts, network} = hre;
	const {deploy} = deployments;

	const {deployer} = await getNamedAccounts();
	let contract_owner = await ethers.getSigner(deployer);

	console.log('Deployer: ', deployer)
	const usdt = await deploy('TestToken', {
		from: deployer,
		args: ['USD Tether', 'USDT', 18],
		log: true,
		autoMine: true, // speed up deployment on local network (ganache, hardhat), no effect on live networks
	});
	const usdc = await deploy('TestToken', {
		from: deployer,
		args: ['USDC', 'USDC', 6],
		log: true,
		autoMine: true, // speed up deployment on local network (ganache, hardhat), no effect on live networks
	});


	// const dr = await deploy('TestToken', {
	// 	from: deployer,
	// 	args: ['Celo USD', 'CUSD', 6],
	// 	log: true,
	// 	autoMine: true, // speed up deployment on local network (ganache, hardhat), no effect on live networks
	// });

	const nft = await deploy('StoreFrontNFTReceipt', {
		from: deployer,
		args: [],
		log: true,
		autoMine: true, // speed up deployment on local network (ganache, hardhat), no effect on live networks
	});

	// await deploy('Nft', {
	// 	from: deployer,
	// 	args: [],
	// 	log: true,
	// 	autoMine: true, // speed up deployment on local network (ganache, hardhat), no effect on live networks
	// });

	// const faucetContract = await ethers.getContract('Faucet');

	// let token = await ethers.getContractAt('TestToken', usdt.address, contract_owner);
	// let tx = await token.transfer(faucetContract.address, ethers.utils.parseEther('1000000'));
	// await tx.wait();

	// token = await ethers.getContractAt('TestToken', usdc.address, contract_owner);
	// tx = await token.transfer(faucetContract.address, ethers.utils.parseEther('1000000'));
	// await tx.wait();

	
	


	// const c = [
	// 	// {
	// 	// 	name: 'Mock Wrapped tEVMOS',
	// 	// 	symbol: 'mTEVMOS',
	// 	// },
	// 	{
	// 		name: 'tzP2P',
	// 		symbol: 'tzP2P',
	// 	},
	// 	// {
	// 	// 	name: 'Mock USD Tether',
	// 	// 	symbol: 'mUSDT',
	// 	// },
	// 	// {
	// 	// 	name: 'Mock Circle USD',
	// 	// 	symbol: 'mUSDC',
	// 	// },
	// ];

	// const logTickets = [];
	// for (let index = 0; index < c.length; index++) {
	// 	const element = c[index];
	// 	const dr = await deploy('TestToken', {
	// 		from: deployer,
	// 		args: [element.name, element.symbol],
	// 		log: true,
	// 		autoMine: true, // speed up deployment on local network (ganache, hardhat), no effect on live networks
	// 	});

	// 	const token = await ethers.getContractAt('TestToken', dr.address, contract_owner);

	// 	const tx = await token.transfer(faucetContract.address, ethers.utils.parseEther('1000000'));
	// 	await tx.wait();

	// 	logTickets.push({
	// 		currency: element.symbol,
	// 		address: dr.address,
	// 	});
	// }

	// writeFileSync(
	// 	join(__dirname, '/../tokens-deployed/', (network.config.chainId?.toString() ?? '') + '_tokens.json'),
	// 	JSON.stringify(logTickets, null, 2),
	// 	{
	// 		flag: 'w',
	// 	}
	// );

	// console.log(JSON.stringify(logTickets, null, 2));
};
export default func;
func.tags = ['tokens'];
