import { Component } from '@angular/core';
import { fetchBalance, switchNetwork, readContract,  writeContract, waitForTransaction, connect } from '@wagmi/core';
import { combineLatest, Subscription } from 'rxjs';

import { Web3Service, wagmiConfig } from './services/web3.service';

import './utils/json-extend';


import { parseEther } from 'viem';
import { nftAuctionManagerAddress } from 'src/constants';
import { delay } from './utils/delay';
import { HttpClient } from '@angular/common/http';
import {paymentCurrencies, testContract} from './models/contracts';


const TestABI = require( "../assets/abis/test.json");


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Buddy';

  isNavbarCollapsed=true;

  selectedNetwork?: number;

  networkList?: any[];

  unsubscribeChain?: Subscription;

  balance : any;

  isRegistered = false

  celoBalance: any = 'not';




  constructor(public  w3s: Web3Service, private http: HttpClient){
    
  }

  async ngOnInit(){
    
    this.networkList= this.w3s.chains;
    

    setTimeout(()=>{
      this.unsubscribeChain =  combineLatest([this.w3s.chainId$, this.w3s.account$]).subscribe(async ([chainId, account])=>{
      
        if(!chainId || !account) return;
        this.selectedNetwork = chainId; 
  
                
  
        // let celoBalance = await fetchBalance({
        //   address: account as any,
        //   formatUnits: 'ether',
        //   chainId
        // })
        // console.log('chain:'+ chainId, ', CUSD: ', paymentCurrencies[chainId].CUSD)
        // let cusdBalance = await fetchBalance({
        //   address: account as any,
        //   formatUnits: 'ether',
        //   token: paymentCurrencies[chainId].CUSD as any,
        //   chainId
        // })
  
        // this.celoBalance='accoutn: '+ account+ ', celo:'+ celoBalance.formatted+ ', cusd: '+ cusdBalance.formatted
  
        // console.log('accoutn: ', account, ', celo:', celoBalance.formatted, ', cusd: ', cusdBalance.formatted)
  
        // alert('accoutn: '+ account+ ', celo:'+ celoBalance.formatted+ ', cusd: '+ cusdBalance.formatted)
  
        // const add = testContract[chainId] //  '0xe8d2FDeAd7f4875D277c5f6B507bdF10Fed057Fb'
        // // console.log('App c : ', chainId, account)
        // let read = await readContract({
        //   abi: TestABI,
        //   address: add,
        //   functionName: 'r',
          
        //   args: [
            
        //   ],
        //   // chain: this.w3s.chainId
        // })
  
        // alert('read: '+ read)

        // let x = await writeContract({
        //   abi: TestABI,
        //   address: add,
        //   functionName: 't',
          
        //   args: [
            
        //   ],
        //   // chain: this.w3s.chainId
        // })

        // await waitForTransaction({
        //   chainId,
        //   hash: x.hash
        // })

        // read = await readContract({
        //   abi: TestABI,
        //   address: add,
        //   functionName: 'r',
          
        //   args: [
            
        //   ],
        //   // chain: this.w3s.chainId
        // })
  
        // alert('read2: '+ read)
  
        
      })
    }, 200)
    
    

    

    

    


  }

  ngOnDestroy(){
    this.unsubscribeChain?.unsubscribe();
  }

  async onSwitchNetwork(newNetwork: any){

    this.selectedNetwork=newNetwork;


    await switchNetwork(wagmiConfig, {
      chainId: newNetwork
    });

  }

  async connectCoinbaseSmartWallet(){
    // wagmiConfig.connectors.find
    const coinbaseWalletConnector = wagmiConfig.connectors.find(
      (connector) => connector.id === "coinbaseWalletSDK"
    );

    if (coinbaseWalletConnector) {
        connect(wagmiConfig, { connector: coinbaseWalletConnector });
    }
  }

  async test(){
    const add = '0xe8d2FDeAd7f4875D277c5f6B507bdF10Fed057Fb'

    const hash = await writeContract(wagmiConfig, {
      abi: TestABI,
      address: add,
      functionName: 't',
      
      args: [
        
      ],
      // chain: this.w3s.chainId
    })

    const txReceipt = await waitForTransaction( 
      wagmiConfig,
      { hash: hash }
    )

    await delay(2000);

    console.log('txReceipt:', txReceipt)
    alert('txReceipt:' + txReceipt)

    if(txReceipt.status== 'success'){
      alert('Succeded')
      const read = await readContract(wagmiConfig,{
        abi: TestABI,
        address: add,
        functionName: 'r',
        
        args: [
          
        ],
        // chain: this.w3s.chainId
      })

      alert('read: '+ read)
      return;
    }else{
      alert('Error faied')
    }
  }



}
