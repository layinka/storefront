import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import {  getPublicClient, readContract, readContracts, waitForTransaction, writeContract } from '@wagmi/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription, combineLatest, lastValueFrom } from 'rxjs';
import contracts, { paymentCurrencies } from '../models/contracts';
import { AppToastService } from '../services/app-toast.service';
import { Web3Service, wagmiConfig } from '../services/web3.service';
import { formatIPFS_CID_ToGatewayUrl } from '../utils/ipfs';
import { delay } from 'src/app/utils/delay';
import { Web3Storage } from 'web3.storage';
import { environment } from 'src/environments/environment';
import { erc20Abi, formatUnits, parseAbiItem, parseEther, parseUnits } from 'viem';
import { createEventFilter, getFilterLogs } from 'viem/actions';

// @ts-ignore
import EthereumQRPlugin from 'ethereum-qr-code';
import { parse, build } from 'eth-url-parser';
import { publicClientToProvider } from '../utils/ethers-wagmi-adapter';
import parseEventLogs from '../utils/parseEventLogs';

const POSFactoryABI = require( "../../assets/abis/pos-factory.json");
const POSABI = require( "../../assets/abis/pos.json");

@Component({
  selector: 'app-complete-order',
  templateUrl: './complete-order.component.html',
  styleUrls: ['./complete-order.component.scss']
})
export class CompleteOrderComponent {
  unsubscribeChain?: Subscription;

  posAddress?: string;

  id?: any;

  ipfsCID?: string;

  ipfsBaseUrl?: string;

  isRegistered = false

  cart?: {
    productName: string, 
    price: number, 
    image: string,
    quantity: number
  }[] 

  orderDetails?:  {
    metadataUrl: any;
    amount: any;
    token: any;
    paid: any;
  };

  orderMetadata: any

  total: any;
  totalInUserCurrency: any;
  tokenAddress: any;
  currency:any

  loading = true


  constructor(public  w3s: Web3Service,
    private route: ActivatedRoute,
    private router: Router,
    private spinner: NgxSpinnerService,
    private toastService: AppToastService,
    private httpClient: HttpClient){
    
  }

  async ngOnInit(){
    console.log('on init ')
    
        
    this.unsubscribeChain =  combineLatest([this.route.params, this.w3s.chainId$, this.w3s.account$]).subscribe(async ([params,chainId, account])=>{
      if(!chainId || !account) return;

      this.loading=true

      this.posAddress = params['a'];
      this.id = params['id'];
      
      if(!this.posAddress || !this.id){
        this.router.navigate(['/']);
      }



      const [metadataUrl,amount, token, paid] = (await readContract(wagmiConfig,{
        address: this.posAddress as `0x${string}`,
        abi: POSABI,
        functionName: 'getOrderDetails',
        args: [this.id]
      })   ) as any
      // console.log('[metadataUrl,amount, token, paid]: ', [metadataUrl,amount, token, paid])

      this.orderDetails = {
        metadataUrl: formatIPFS_CID_ToGatewayUrl(metadataUrl??''),
        amount, token, paid
      }
      // console.log('orderDetails: ', this.orderDetails)

    //   const allowance = await readContract({
    //     abi: erc20ABI,
    //     address: this.orderDetails?.token as `0x${string}`,
    //     functionName: 'allowance',
    //     args: [
    //       this.w3s.account as `0x${string}`,
    //       this.posAddress as `0x${string}`,

    //     ],
    // })
    // console.log('allwoance:', formatUnits(allowance,6) )

      
      const r: any = await lastValueFrom(this.httpClient.get(this.orderDetails.metadataUrl + '/order.json'))
      this.orderMetadata = r.order

      // console.log('orderMetadata: ', this.orderMetadata)
      

      this.cart=[]
      for(let i=0; i< this.orderMetadata.orderedItems.length; i++){
        this.cart?.push({
          
          ...this.orderMetadata.orderedItems[i],
          image: `${this.ipfsBaseUrl}${this.orderMetadata.orderedItems[i].image}` 
        })
      }
      this.total = this.orderMetadata.total
      this.totalInUserCurrency = formatUnits( this.orderMetadata.totalInUserCurrency, this.orderMetadata.currency=='USDT'?6:18)
      this.tokenAddress = this.orderMetadata.tokenAddress
      this.currency=this.orderMetadata.currency

      this.loading=false;

      setTimeout(()=>{
        // later in code
        const qr = new EthereumQRPlugin();

        const options ={
          "to": this.posAddress,
          // "from": "0xsenderaddress",
          "value": 0,
          "gas": 1000000,
          "mode": "contract_function",
          "functionSignature": {
            "name": "completeOrder",
            "payable": false,
            "args": [
              {
                "name": "orderId",
                "type": "uint"
              }
            ]
          }
        }
        const qrCode = qr.toCanvas(options, {
          selector: '#my-qr-code',
          size:320,
          options: {
            margin: 2
          }
        });
      },2000)

      // QR
      // const parsedUrl = parse('ethereum:0x1234DEADBEEF5678ABCD1234DEADBEEF5678ABCD')
      // console.log(parseUrl.target_address)
      // // '0x1234DEADBEEF5678ABCD1234DEADBEEF5678ABCD'

      // const url =  build({
      //         scheme: 'ethereum',
      //         prefix: 'pay',
      //         target_address: '0x1234DEADBEEF5678ABCD1234DEADBEEF5678ABCD'
      //     });
      // console.log(url);
      // // 'ethereum:pay-0x1234DEADBEEF5678ABCD1234DEADBEEF5678ABCD'
      
    })

  }

  async afterViewInit(){
    console.log('after view')
  }


  get url(){
    return window.location.href ;// window.location.pathname
  }

  async pay(){

    this.spinner.show();

    try {
      
      const publicClient = await getPublicClient(wagmiConfig)

      const allowance = await readContract(wagmiConfig,{
          abi: erc20Abi,
          address: this.orderDetails?.token as `0x${string}`,
          functionName: 'allowance',
          args: [
            this.w3s.account as `0x${string}`,
            this.posAddress as `0x${string}`,

          ],
      })
      console.log('allwoance:', formatUnits(allowance,18) )
      console.log('Token:', this.orderDetails?.token )

      if(+formatUnits(allowance,18) < 1000){
        
        //Approve
        const approveHash = await writeContract(wagmiConfig,{
          abi: erc20Abi,
          address: this.orderDetails?.token as `0x${string}`,
          functionName: 'approve',
          args: [
            this.posAddress as `0x${string}`,
            parseUnits('100000000',18)

          ],
          // chain: this.w3s.chainId
        })

        await waitForTransaction(wagmiConfig, 
          { hash: approveHash }
        )
      }

      
      
      const hash = await writeContract(wagmiConfig,{
        abi: POSABI,
        address: this.posAddress as `0x${string}`,
        functionName: 'completeOrder',
        args: [
          this.id
        ],
        // chain: this.w3s.chainId
      })

      await waitForTransaction( 
        wagmiConfig,
        { hash: hash }
      )

      await delay(2000);

      let logs;

      if(this.w3s.chainId!=31337){// eth_filter not supported
        const provider = publicClientToProvider(publicClient!)

        logs = await parseEventLogs(provider, hash,['event PurchaseCompleted(address payer, uint orderId, uint receiptTokenId)'], 'PurchaseCompleted')

        // console.log(eventLog)

        // const posAddress1 = eventLog[0].args['posAddress']

        // this.spinner.hide()
        // this.toastService.show('StoreFront Created', 'Store Front Created successfully!')
        // this.router.navigate(['/sell', posAddress1]);
        // return;
      }else{
        //@ts-ignore
        const filter = await createEventFilter(publicClient, {
          address: this.posAddress as `0x${string}`,
          event: parseAbiItem('event PurchaseCompleted(address payer, uint orderId, uint receiptTokenId)'),
        });

        //@ts-ignore
        logs = await getFilterLogs(publicClient, {filter: filter})
      }

      

      // console.log('logs', logs)

      const orderId = logs[0]['args']['orderId'].toString()
      const tokenId = logs[0]['args']['receiptTokenId'].toString()

      // console.log('orderId:', orderId)

      this.spinner.hide()
      this.toastService.show('Order Paid', 'Order Paid successfully!')
      this.router.navigate(['/completed',this.posAddress, orderId, tokenId]);
    } catch (error) {
      console.error(error)
      this.spinner.hide()
      this.toastService.error('Failed', 'Payment Failed!')
      
    }
  }

}
