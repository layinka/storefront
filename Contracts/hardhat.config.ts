import 'dotenv/config';
import {HardhatUserConfig} from 'hardhat/types';
import 'hardhat-deploy';
import '@nomiclabs/hardhat-ethers';
import 'hardhat-deploy-ethers';
import 'hardhat-gas-reporter';
import '@typechain/hardhat';
import 'solidity-coverage';
import 'hardhat-deploy-tenderly';
import 'hardhat-contract-sizer';
import {node_url, accounts, addForkConfiguration} from './utils/network';
import "./tasks"


const celoAccounts = {
	mnemonic: process.env.MNEMONIC_MAINNET || "test test test test test test test test test test test junk",
	// accountsBalance: "990000000000000000000",
  }

const config: HardhatUserConfig = {
	solidity: {
		compilers: [
			{
				version: '0.8.18',
				settings: {
					optimizer: {
						enabled: true,
						runs: 200,
						details: {
							yul: true,
						},
					},
					viaIR: true,
				},
			},
			{
				version: '0.8.25',
				settings: {
					optimizer: {
						enabled: true,
						runs: 200,
						details: {
							yul: true,
						},
					},
					viaIR: true,
				},
			},
		],
	},
	namedAccounts: {
		deployer: 0,
		simpleERC20Beneficiary: 1,
	},
	networks: addForkConfiguration({
		hardhat: {
			initialBaseFeePerGas: 0, // to fix : https://github.com/sc-forks/solidity-coverage/issues/652, see https://github.com/sc-forks/solidity-coverage/issues/652#issuecomment-896330136
		},
		// localhost: {
		// 	url: node_url('localhost'),
		// 	accounts: accounts(),
		// },
		ganache: {
			url: 'http://127.0.0.1:7545',
			accounts: [
				'7c764ca90dab0468b163bb8272e247eb06abd756072b7c80e9e2f88e24b3b518',
				'dac5005f97f0be8bb23879f38a9ca93c60410d20796806d23f03aac88a1964a3',
				'767b05471aa3713700998846d7be6038db16d5e29e7460c604bb382fcf4100a3',
				'67d7a67d19c2d63df22f4078f5e7732f500fe37bc42660510e09da038814fa5e',
			],
			live: false,
			saveDeployments: true,
			tags: ['local'],
		},
		staging: {
			url: node_url('rinkeby'),
			accounts: accounts('rinkeby'),
		},
		production: {
			url: node_url('mainnet'),
			accounts: accounts('mainnet'),
		},
		mainnet: {
			url: node_url('mainnet'),
			accounts: accounts('mainnet'),
		},
		rinkeby: {
			url: node_url('rinkeby'),
			accounts: accounts('rinkeby'),
		},
		kovan: {
			url: node_url('kovan'),
			accounts: accounts('kovan'),
		},
		goerli: {
			url: node_url('goerli'),
			accounts: accounts('goerli'),
		},
		theta_t: {
			url: 'https://eth-rpc-api-testnet.thetatoken.org/rpc',
			accounts:
				process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY, process.env.PRIVATE_KEY_2!] : [],
			chainId: 365,
		},
		okb_test: {
			url: 'https://okbtestrpc.okbchain.org',
			accounts:
				process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY, process.env.PRIVATE_KEY_2!] : [],
			chainId: 195,
		},
		evmos_t: {
			url: 'https://eth.bd.evmos.dev:8545',
			accounts:
				process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY, process.env.PRIVATE_KEY_2!] : [],
			chainId: 9000,
		},
		fantom_t: {
			url: "https://rpc.ankr.com/fantom_testnet/",
			accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY, process.env.PRIVATE_KEY_2!] : [],
			chainId: 4002,
		  }, 
		fantom: {
			url: 'https://rpc.fantom.network',
			accounts:
				process.env.PRIVATE_KEY_FTM_1 !== undefined ? [process.env.PRIVATE_KEY_FTM_1, process.env.PRIVATE_KEY!] : [],
			chainId: 250,
		},
		aurora: {
			url: "https://mainnet.aurora.dev",
			accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY, process.env.PRIVATE_KEY_2!] : [],
			chainId: 1313161554 ,
		},
		aurora_t: {
			url: "https://testnet.aurora.dev/",
			accounts: process.env.PRIVATE_KEY_3 !== undefined ? [process.env.PRIVATE_KEY_3, process.env.PRIVATE_KEY_2!] : [],
			chainId: 1313161555,
		},
		celo: {
			url: "https://forno.celo.org",
			accounts:  process.env.PRIVATE_KEY_FTM_1 !== undefined ? [process.env.PRIVATE_KEY_FTM_1, process.env.PRIVATE_KEY_2!] : [],
			chainId: 42220,
			live: true,
			saveDeployments: true,
		},
		"celo_t": {// alfajores
			url: "https://alfajores-forno.celo-testnet.org",
			accounts: process.env.PRIVATE_KEY_3 !== undefined ? [process.env.PRIVATE_KEY_3, process.env.PRIVATE_KEY_2!] : [],
			chainId: 44787,
			live: true,
			saveDeployments: true,
		},
		"base_t": { //Base test
			url: "https://sepolia.base.org",
			accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY, process.env.PRIVATE_KEY_2!] : [],
			chainId: 84532 ,
			gasPrice: 350000000,
			
			
		},
	}),
	paths: {
		sources: 'src',
	},
	gasReporter: {
		currency: 'USD',
		gasPrice: 100,
		enabled: process.env.REPORT_GAS ? true : false,
		coinmarketcap: process.env.COINMARKETCAP_API_KEY,
		maxMethodDiff: 10,
	},
	typechain: {
		outDir: 'typechain',
		target: 'ethers-v5',
	},
	mocha: {
		timeout: 0,
	},
	external: process.env.HARDHAT_FORK
		? {
				deployments: {
					// process.env.HARDHAT_FORK will specify the network that the fork is made from.
					// these lines allow it to fetch the deployments from the network being forked from both for node and deploy task
					hardhat: ['deployments/' + process.env.HARDHAT_FORK],
					localhost: ['deployments/' + process.env.HARDHAT_FORK],
				},
		  }
		: undefined,

	tenderly: {
		project: 'template-ethereum-contracts',
		username: process.env.TENDERLY_USERNAME as string,
	},
	contractSizer: {
		alphaSort: true,
		disambiguatePaths: false,
		runOnCompile: true,
		strict: true,
		only: [':Faucet*',  'POS*', 'Types', 'StoreFrontNFTReceipt'],
	},
};

export default config;
