import { Injectable } from '@angular/core';



import { arbitrum, hardhat, mainnet, polygon, scrollSepolia, celoAlfajores, celo, mantle, 
  mantleTestnet, aurora, auroraTestnet, base, sepolia,baseSepolia } from '@wagmi/core/chains'
import { BehaviorSubject, lastValueFrom, shareReplay } from 'rxjs';
import { createConfig, fetchToken, getAccount, getBalance, getBlock, getChainId, getClient, 
  getToken, injected, readContract, signMessage, watchAccount, watchChainId } from '@wagmi/core';
import contracts from '../models/contracts';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

import { CeloProvider, CeloWallet } from '@celo-tools/celo-ethers-wrapper'
import { getEthersProvider, getEthersSigner } from '../utils/ethers-wagmi-adapter';
import {Chain, erc20Abi, erc721Abi, getContract} from 'viem'




import { FallbackTransport, formatUnits, http, parseUnits } from 'viem';
import { type GetChainIdReturnType } from '@wagmi/core'
import { coinbaseWallet, walletConnect } from '@wagmi/connectors';
import { createWeb3Modal } from '@web3modal/wagmi';
import { Unit } from '@wagmi/core/dist/types/types/unit';

const POSFactoryABI = require( "../../assets/abis/pos-factory.json");

// const projectId = '2539776ca1c175425265b3c233b9ed66'



const projectId = environment.walletConnectProjectId;

const metadata = {
  name: 'Web3Modal',
  description: 'StoreFront',
  url: 'https://storefront.zarclays.com', // url must match your domain & subdomain
  icons: ['https://avatars.githubusercontent.com/u/37784886']
}

export const chainList: any = [hardhat,  baseSepolia, base]
//@ts-ignore
export const wagmiConfig = createConfig({
  chains: chainList,
  connectors: [
    walletConnect({ projectId: projectId, metadata, showQrModal: false }),
    injected({ shimDisconnect: true }),
    // coinbaseWallet({
    //   appName: metadata.name,
    //   appLogoUrl: metadata.icons[0]
    // })
    coinbaseWallet({ 
      appName: metadata.name,
      appLogoUrl: metadata.icons[0], 
      preference: 'smartWalletOnly' 
    }),
  ],
  transports: {
    [hardhat.id]: http(),
    // [mainnet.id]: http(),
    // [sepolia.id]: http(),
    [base.id]: http(),
    [baseSepolia.id]: http("https://api.developer.coinbase.com/rpc/v1/base-sepolia/xbCpBPNZlgaflnfPY81NM6E2M9ApALr4"),
    // [etherlinkTestnet.id]: http(),
    // [shardeumSphinx.id]: http(),
    // [fraxtal.id]: http(),
    // [fraxtalTestnet.id]: http(),
  },
})

export const chains: Record<number, Chain> = {
  // 1: mainnet,
  84532: baseSepolia,
  8453: base,
  
  31337: hardhat


} 

@Injectable({
  providedIn: 'root'
})
export class Web3Service {

  chains = chainList
  
  w3modal: any;

  private _chainId$ = new BehaviorSubject<number|undefined>(undefined);
  
  public chainId$ = this._chainId$.asObservable()

  public get chainId(){
    
    return this._chainId$.value;
  }

  private _account$ = new BehaviorSubject<string|undefined>(undefined);
  
  public account$ = this._account$.asObservable()

  public get account(){
    
    return this._account$.value;
  }

  private _w3mState$ = new BehaviorSubject<{open?: boolean,selectedNetworkId?: number}|undefined>(undefined);
  
  public w3mState$ = this._w3mState$.asObservable()

  public get w3mState(){
    
    return this._w3mState$.value;
  }

  unwatchAccount : any;

  unwatchNetwork : any;

  // private _connected$ = new BehaviorSubject<boolean|undefined>(undefined);
  
  // public connected$ = this._connected$.asObservable()

  // public get connected(){
    
  //   return this._connected$.value;
  // }

  // unwatchConnection : any;


  constructor(private httpClient: HttpClient) {
    setTimeout(() => {
      setTimeout(async ()=>{
        
          
        const {address, isConnected} = getAccount(wagmiConfig);
        if(isConnected){
          this._account$.next(address)
        }
        // else{
        //   await this.w3modal.open();
        // }
        
        const chainId   = getChainId(wagmiConfig);
        if(chainId ){
          
          this._chainId$.next(chainId );
        }

        //Update chainId on change
        this.unwatchNetwork = watchChainId(wagmiConfig,      
          {
            onChange:  async (chainId) => {
              console.log('Chain ID changed!', chainId)
              if(chainId ){
                
                this._chainId$.next(chainId );

              }else{
                this._chainId$.next(undefined);
              }
            },
          }
        ); 
        
        this.unwatchAccount = watchAccount(wagmiConfig, {
          onChange: (account) => {
            if(account && account.isConnected){
              this._account$.next(account.address);
            }else{
              this._account$.next(undefined);
            }
            
          }
        })
        
        
          
      }, 250)



      const w3m = createWeb3Modal({
        wagmiConfig: wagmiConfig,
        projectId: projectId,
        enableAnalytics: true, // Optional - defaults to your Cloud configuration
        enableOnramp: true, // Optional - false as default
        themeVariables: {
          // '--w3m-color-mix': '#a612a6',
          // '--w3m-color-mix-strength': 60,
          // '--w3m-accent' : '#a612a6'
        }
  
      })
      this.w3modal=w3m
      w3m.subscribeState(newState => {
        
        this._w3mState$.next(newState)
      })
    }, 500);
    // createWeb3Modal({
    //   wagmiConfig: wagmiConfig,
    //   projectId: projectId,
    //   enableAnalytics: true, // Optional - defaults to your Cloud configuration
    //   enableOnramp: true, // Optional - false as default

    // }).open({

    // })

    


    
    

    

    // this.unwatchConnection = watchConnections(wagmiConfig, {
    //   onChange: (connected) => {
    //     if(connected && connected[0].connector.){
    //       this._account$.next(account.address);
    //     }else{
    //       this._account$.next(undefined);
    //     }
        
    //   }
    // })



  }


  async getAccountInfo() {
    return getAccount(wagmiConfig);
  }

  getCurrentChainId() {
    const c: GetChainIdReturnType = getChainId(wagmiConfig);
    return c;
  }

  getCurrentChainNativeCoin() {
    const c: GetChainIdReturnType = getChainId(wagmiConfig);
    return chains[c].nativeCurrency
  }

  getChainName(chainId: number){
    const chain = chains[chainId]
    if(chain){
      return chain.name
    }else{
      return undefined
    }

  }

  getChain(chainId: number){
    const chain = chains[chainId]
    if(chain){
      return chain
    }else{
      return undefined
    }

  }

  async getDateFromBlockNumber(blockNumber: number,chainId?: any){
    const block = await getBlock(wagmiConfig, {
      blockNumber: BigInt(blockNumber),
      chainId
    })
    if(block){
       // Convert the block's timestamp to a Date object
      const blockDate = new Date((+block.timestamp.toString()) * 1000);
      return blockDate;
    }else{
      return undefined
    }

  }

  
  async getERC20Balance(tokenAddress?: string, account?: string) {
    
    return await getBalance(wagmiConfig, {
      address: account as `0x${string}`,      
      token: tokenAddress as `0x${string}`
    });
  }
 


  async getERC20Allowance(tokenAddress: string|`0x${string}`, contractToApprove: string|`0x${string}`, account?: string|`0x${string}`,
   chainId? :any) {

    if(!account){
      account=this.account;
    }
    
    
    //@ts-ignore
    const allowance = await readContract(wagmiConfig, {
      address: tokenAddress as `0x${string}`,
      abi: erc20Abi,      
      functionName: 'allowance',
      args: [account as `0x${string}`, contractToApprove as `0x${string}`],
      chainId
    })
    
    return allowance;
  }


  async approveERC20Contract(tokenAddress: string, contractToApprove: string, 
    account: string, amount: bigint, chainId? :any){

    
    //@ts-ignore
    // const simu = await simulateContract(wagmiConfig, {
    //   address: tokenAddress as `0x${string}`,
    //   abi: erc20Abi,      
    //   account: account as `0x${string}`,
    //   functionName: 'approve',
    //   args: [ contractToApprove as `0x${string}`, amount],
    //   chainId
    // })
 
    //@ts-ignore
    return await writeContract(wagmiConfig,{
      address: tokenAddress as `0x${string}`,
      abi: erc20Abi,      
      account: account as `0x${string}`,
      functionName: 'approve',
      args: [ contractToApprove as `0x${string}`, amount],
      chainId
    });

    
  }

  async signLoginMessage( timestamp: any) {
    const signature = await signMessage(wagmiConfig,{
      message: `Login to PopCoin: ${timestamp}`
    });
    return signature;
  }

  // async fetchTotalSupply(tokenAddress: string){
  //   const t= await this.getTokenInfo(tokenAddress as `0x${string}`)
  //   if(t){
  //     return t.totalSupply.value
  //   }

  //   return undefined
  // }
  async getTokenInfo(tokenAddress: `0x${string}`, chainId: number|undefined=undefined, formatUnits: Unit | undefined = undefined) {
    return await getToken(wagmiConfig, {
      address: tokenAddress,
      chainId,
      formatUnits
    });
  }

  async getERC20Contract(tokenAddress: `0x${string}`, chainId?: number|undefined) {
    return await getContract( {
      address: tokenAddress,
      abi: erc20Abi,
      // chainId: chainId?31337,
      // publicClient,
      client: getClient(wagmiConfig, {
        chainId
      })
    })
  }

  async getERC721TokenInfo(tokenAddress: `0x${string}`, chainId?: number|undefined) {
    const erc721: any = await getContract({
      address: tokenAddress,
      abi: erc721Abi,
      client: getClient(wagmiConfig,{
        chainId
      })
      // chainId
    })
    
    return ({
      address: tokenAddress,
      name: await erc721.read.name(),
      symbol: await erc721.read.symbol()
      
    });
  }


  async hasRegistered(){

    return await readContract(wagmiConfig,{
      address: contracts[this.chainId??31337],
      abi: POSFactoryABI,
      functionName: 'hasPOS',
      args: [this.account!]
    }) as any as boolean
  }

  getCurrencyRates() {
    //
    const url = `https://min-api.cryptocompare.com/data/price?fsym=NGN&tsyms=USDT,USD,EUR,NEAR&api_key=${environment.cryptoCompareApiKey}`
    return this.httpClient.get(url).pipe(shareReplay(1))
  }

  async getPriceInUSDT(amountInNGN: number){
    const rates: any = await lastValueFrom( this.getCurrencyRates());
    
    return amountInNGN * rates.USDT;
  }
  async getPriceInNear(amountInNGN: number){
    const rates: any = await lastValueFrom( this.getCurrencyRates());
    return amountInNGN * rates.NEAR;
  }
}

