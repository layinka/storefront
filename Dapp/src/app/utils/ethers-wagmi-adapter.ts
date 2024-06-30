import {  getPublicClient,  getWalletClient } from '@wagmi/core'
import { providers } from 'ethers'

import { wagmiConfig } from '../services/web3.service'

import { type Config, getClient, getConnectorClient } from '@wagmi/core'

import type { Client, Chain, Transport } from 'viem'



import type { Account } from 'viem'

export function publicClientToProvider(client: Client<Transport, Chain>) {
  const { chain, transport } = client
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  }
  if (transport.type === 'fallback')
    return new providers.FallbackProvider(
      (transport.transports as ReturnType<Transport>[]).map(
        ({ value }) => new providers.JsonRpcProvider(value?.url, network),
      ),
    )
  return new providers.JsonRpcProvider(transport.url, network)
}

/** Action to convert a viem Public Client to an ethers.js Provider. */
export function getEthersProvider(
  { chainId }: { chainId?: number } = {},
) {
  const client = getClient(wagmiConfig, { chainId })
  if (!client) return
  return publicClientToProvider(client)
}


 
// export function publicClientToProvider(publicClient: PublicClient) {
//   const { chain, transport } = publicClient
//   const network = {
//     chainId: chain?.id!,
//     name: chain?.name!,
//     ensAddress: chain?.contracts?.ensRegistry?.address,
//   }
//   if (transport.type === 'fallback')
//     return new providers.FallbackProvider(
//       (transport.transports as ReturnType<HttpTransport>[]).map(
//         ({ value }) => new providers.JsonRpcProvider(value?.url, network!),
//       ),
//     )
//   return new providers.JsonRpcProvider(transport.url, network)
// }
 
// /** Action to convert a viem Public Client to an ethers.js Provider. */
// export function getEthersProvider({ chainId }: { chainId?: number } = {}) {
//   const publicClient = getPublicClient(wagmiConfig,{ chainId })
//   return publicClientToProvider(publicClient!)
// }


export function walletClientToSigner(client: Client<Transport, Chain, Account>) {
  const { account, chain, transport } = client
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  }
  const provider = new providers.Web3Provider(transport, network)
  const signer = provider.getSigner(account.address)
  return signer
}

/** Action to convert a Viem Client to an ethers.js Signer. */
export async function getEthersSigner(
  { chainId }: { chainId?: number } = {},
) {
  const client = await getConnectorClient(wagmiConfig, { chainId })
  return walletClientToSigner(client)
}


// export function walletClientToSigner(walletClient: WalletClient) { 
//     const { account, chain, transport } = walletClient
//     const network = {
//       chainId: chain!.id!,
//       name: chain!.name,
//       ensAddress: chain!.contracts?.ensRegistry?.address,
//     }
//     const provider = new providers.Web3Provider(transport, network)
//     const signer = provider.getSigner(account!.address)
//     return signer
//   }
   
//   /** Action to convert a viem Wallet Client to an ethers.js Signer. */
//   export async function getEthersSigner({ chainId }: { chainId?: number } = {}) {
//     const walletClient = await getWalletClient(wagmiConfig,{ chainId })
//     if (!walletClient) return undefined
//     return walletClientToSigner(walletClient)
//   }