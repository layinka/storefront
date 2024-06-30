// import { ethers } from "hardhat";
require("dotenv").config();

const hre = require('hardhat')
const network = require('hardhat')


async function main() {


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

let tCtrt = await ethers.getContractFactory('Test')
let test = await tCtrt.deploy()
await test.deployed()
console.log('Test Contract deployed:', test.address)



}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});