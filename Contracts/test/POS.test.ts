import {expect} from './chai-setup';
import {ethers, deployments, getUnnamedAccounts, getNamedAccounts, network } from 'hardhat';
import {IERC20, POSFactory, StoreFrontNFTReceipt} from '../typechain';
import {setupUser, setupUsers} from './utils';

const setup = deployments.createFixture(async () => {
	await deployments.fixture('POS');
	const {deployer} = await getNamedAccounts();
	const accounts = await getUnnamedAccounts();

	console.log('all accounts: ', accounts)
	const contracts = {
		POSFactory: <POSFactory>await ethers.getContract('POSFactory'),
		StoreFrontNFTReceipt: <StoreFrontNFTReceipt>await ethers.getContract('StoreFrontNFTReceipt'),
		USDCToken: <StoreFrontNFTReceipt>await ethers.getContract('TestToken'),

	};
	const users = await setupUsers(await getUnnamedAccounts(), contracts);
	return {
		...contracts,
		users,
		// simpleERC20Beneficiary: await setupUser(simpleERC20Beneficiary, contracts),
	};
});

describe('POSFactry', function () {
	it('creates pos', async function () {
		const {users, POSFactory, USDCToken} = await setup();
		await expect(users[0].POSFactory.createPOS("store 1", USDCToken.address , "ipfs://cid/")) //.to.not.be.revertedWith('NOT_ENOUGH_TOKENS');
			.to.emit(POSFactory, 'POSCreated')
			//.withArgs(users[0].address);
	});

});
