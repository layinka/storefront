// import { ethers } from "hardhat";
require("dotenv").config();

const hre = require('hardhat')
const network = require('hardhat')


async function main() {
//   const currentTimestampInSeconds = Math.round(Date.now() / 1000);
//   const unlockTime = currentTimestampInSeconds + 60;

//   const lockedAmount = ethers.utils.parseEther("0.001");

//   const lock = await ethers.deployContract("Lock", [unlockTime], {
//     value: lockedAmount,
//   });

//   await lock.waitForDeployment();

//   console.log(
//     `Lock with ${ethers.formatEther(
//       lockedAmount
//     )}ETH and unlock timestamp ${unlockTime} deployed to ${lock.target}`
//   );


const ethers = hre.ethers
const accounts = await hre.ethers.getSigners()
  
// FOR NEW DEPLOYMENT //
const [deployer] = accounts
console.log(`deployer address ${deployer.address}`)

const alfajoresCUSD = '0x874069fa1eb16d44d622f2e0ca25eea172369bc1'
// let tokenCtrct = await ethers.getContractFactory('TestToken')
// let token = await tokenCtrct.deploy('USD Tether', 'USDT')
// await token.deployed()
// console.log('Token deployed:', token.address)

let nftTokenCtrct = await ethers.getContractFactory('StoreFrontNFTReceipt')
let nftToken = await nftTokenCtrct.deploy()
await nftToken.deployed()
console.log('NFT Token deployed:', nftToken.address)

let posFactory = await ethers.getContractFactory('POSFactory')
let pos = await posFactory.deploy(nftToken.address)
await pos.deployed()
console.log('POS Factory deployed:', pos.address)








}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});