import { normalizeHardhatNetworkAccountsConfig } from "hardhat/internal/core/providers/util";

import  { BN, bufferToHex, privateToAddress, toBuffer } from "ethereumjs-util";

module.exports = async function (taskArguments, hre, runSuper) {
  const networkConfig = hre.config.networks["mainnet"]

  console.log(networkConfig.accounts)

  const accounts = normalizeHardhatNetworkAccountsConfig(networkConfig.accounts)

  console.log("Accounts")
  console.log("========", accounts.length)

  try{
  for (const [index, account] of accounts.entries()) {
    const address = bufferToHex(privateToAddress(toBuffer(account.privateKey)))
    const privateKey = bufferToHex(toBuffer(account.privateKey))
    const balance = new BN(account.balance).div(new BN(10).pow(new BN(18))).toString(10)
    console.log(`Account #${index}: ${address} (${balance} ETH)
Private Key: ${privateKey}
`)
  }

}catch(err){
    console.error('eerror:', err)
}
}