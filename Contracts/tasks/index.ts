import { task } from "hardhat/config";

const {
  ethers: {
    constants: { MaxUint256 },
  },
  utils: { defaultAbiCoder },
} = require("ethers");

task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
    const accounts = await hre.ethers.getSigners();
  
    for (const account of accounts) {
      console.log(account.address);
    }
  });

task("accounts-wit-mnemonic", "Prints the list of accounts using Mnemoic", require("./accounts"));



