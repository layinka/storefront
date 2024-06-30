import { base, baseSepolia } from "viem/chains";

const contracts: {
    [chainId: number]: `0x${string}`;       
  } = {
    42220: '0xB19AAfE9aF7Eb36EE4AA32F6b73627D15164C8eB', //Celo Mainnet
    44787:"0xBF718fD6432457AEa5C0812D96b234a9f199e647", // Celo test
    1337: '0x9bE8679d7867E47d2E1B4c96108d443887EA8353',
    31337: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512', //hardhat
    1313161554: '0xbb1B78F7ff18Dcd8Ab9Cca4690C268B72b56389E', //Aurora
    1313161555: '0xA253F38547A0A702EB4aB22A5564Be317b9a7eB7', // Aurora testnet,
    8453: '0xbb1B78F7ff18Dcd8Ab9Cca4690C268B72b56389E', //Base
    84532: '0xBc22E20975E980E484f617f3053680fb01E2e62A' // Base testnet
  }



export const storeFrontNFT :{
  [chainId: number]: `0x${string}`; 
} = {
  42220: '0x8De064c8649f474484dFAb9021Ddb9d05AA602AB', //Celo Mainnet
  44787:"0x848975186fAED2bb14493736Ac99762c4D533c2A", // Celo test
  31337: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
  1313161554: '0xbb1B78F7ff18Dcd8Ab9Cca4690C268B72b56389E', //Aurora
  1313161555: '0xA253F38547A0A702EB4aB22A5564Be317b9a7eB7', //'0x05b8777B6c280DB4E61CF0F63d59b4Ac8ec70538' // Aurora testnet
  8453: '0xbb1B78F7ff18Dcd8Ab9Cca4690C268B72b56389E', //Base
  84532: '0xdfE51561adacdE663fBA63Fbf952A3996F81d1DA' // Base testnet
}

export const paymentCurrencies:{
  [chainId: number]: {
    [coin: string]: `0x${string}`; 
  }; 
} = {
  42220: {
    'CUSD': '0x765de816845861e75a25fca122bb6898b8b1282a',
  },
  44787: {
    'CUSD': '0x874069fa1eb16d44d622f2e0ca25eea172369bc1',
  },
  31337: {
    'USDT': '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0',
    // 'STRF': '0x05b8777B6c280DB4E61CF0F63d59b4Ac8ec70538',
    'USDC': '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9',
  },
  1313161555: {
    'USDT': '0xBF718fD6432457AEa5C0812D96b234a9f199e647',
    'NEAR': '0x05b8777B6c280DB4E61CF0F63d59b4Ac8ec70538',
    'USDC': '0x05b8777B6c280DB4E61CF0F63d59b4Ac8ec70538',
  },
  8453: { //Base
    'USDT': '0xBF718fD6432457AEa5C0812D96b234a9f199e647',
    'USDC': '0x05b8777B6c280DB4E61CF0F63d59b4Ac8ec70538',
  },
  84532: { // Base Test
    'USDT': '0x6dAC4ecECEDf1Fbc7FE28a7875d2f0542A16b2f5',
    'USDC': '0x3537BC4C1890e528e484DD8DE335C17E9195F1d7',
  }

}

//
export const testContract:{
  [chainId: number]: `0x${string}`; 
} = {
  42220: '0x58419c04c57a4a1375c0dF583d8dCEDA0cA594A6',
  44787: '0xe8d2FDeAd7f4875D277c5f6B507bdF10Fed057Fb',
  
}

export default  contracts;  