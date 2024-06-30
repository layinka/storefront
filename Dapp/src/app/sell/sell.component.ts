import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { getPublicClient, readContract, readContracts, waitForTransaction, writeContract } from '@wagmi/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription, combineLatest, lastValueFrom } from 'rxjs';
import contracts, { paymentCurrencies } from '../models/contracts';
import { AppToastService } from '../services/app-toast.service';
import { Web3Service, wagmiConfig } from '../services/web3.service';
import { formatIPFS_CID_ToGatewayUrl } from '../utils/ipfs';
import { delay } from 'src/app/utils/delay';
import { Web3Storage } from 'web3.storage';
import { environment } from 'src/environments/environment';
import { parseAbiItem, parseEther, parseUnits } from 'viem';
import { createEventFilter, getFilterLogs } from 'viem/actions';
import parseEventLogs from '../utils/parseEventLogs';
import { publicClientToProvider } from '../utils/ethers-wagmi-adapter';
import { IpfsService } from '../services/ipfs.service';

const POSFactoryABI = require( "../../assets/abis/pos-factory.json");
const POSABI = require( "../../assets/abis/pos.json");

@Component({
  selector: 'app-sell',
  templateUrl: './sell.component.html',
  styleUrls: ['./sell.component.scss']
})
export class SellComponent {
  unsubscribeChain?: Subscription;

  posAddress?: string;

  ipfsCID?: string;

  ipfsBaseUrl?: string;

  isRegistered = false

  cart?: {
    productName: string, 
    price: number, 
    image: string,
    quantity: number
  }[] 

  rates: any;
  // web3StorageClient? : Web3Storage;

  storeName: any

  storeOwner?: string


  constructor(public  w3s: Web3Service,
    private route: ActivatedRoute,
    private router: Router,
    private spinner: NgxSpinnerService,
    private toastService: AppToastService,
    private httpClient: HttpClient,
    private ipfsService: IpfsService){
    
  }

  async ngOnInit(){

    
        
    this.unsubscribeChain =  combineLatest([this.route.params, this.w3s.chainId$, this.w3s.account$]).subscribe(async ([params,chainId, account])=>{
      if(!chainId || !account) return;

      

      this.posAddress = params['a'];
      
      if(!this.posAddress){
        this.router.navigate(['/signup']);
      }



      const [ipfsCid, owner, storeName] = await readContracts(wagmiConfig,{
        contracts: [
          {
          address: this.posAddress as `0x${string}`,
          abi: POSABI,
          functionName: 'ipfsProductLink',
          args: []
          },
          {
            address: this.posAddress as `0x${string}`,
            abi: POSABI,
            functionName: 'owner',
            args: []
          },
          {
            address: this.posAddress as `0x${string}`,
            abi: POSABI,
            functionName: 'name',
            args: []
          }
        ]
      })  
      this.ipfsCID = ipfsCid.result as any
      this.storeOwner=owner.result as any

      // console.log(this.ipfsCID, ',', this.storeOwner)
      // (await readContract(wagmiConfig,{
      //   address: this.posAddress as `0x${string}`,
      //   abi: POSABI,
      //   functionName: 'ipfsProductLink',
      //   args: []
      // })   ) as any

      this.storeName = storeName.result as any
      //  (await readContract(wagmiConfig,{
      //   address: this.posAddress as `0x${string}`,
      //   abi: POSABI,
      //   functionName: 'name',
      //   args: []
      // })   ) as any
      
      this.ipfsBaseUrl = formatIPFS_CID_ToGatewayUrl(this.ipfsCID??'', `${this.storeOwner}/product-metadata.json`)

      const metadata: any = await lastValueFrom(this.httpClient.get(this.ipfsBaseUrl/* + '/product-metadata.json'*/))

      

      this.cart=[]
      for(let i=0; i< metadata.products.length; i++){
        this.cart?.push({
          quantity: 0,
          ...metadata.products[i],
          image: metadata.products[i].image //`${this.ipfsBaseUrl}${metadata.products[i].image}` 
        })
      }

      this.w3s.getCurrencyRates().subscribe(r=>{
        //USDT: 0.0009602
        // {"USDT":0.0000417,"ETH":0.0005293}
        this.rates = r;

      })
      
    })

    
    // // Construct with token and endpoint
    // this.web3StorageClient = new Web3Storage({ token: environment.web3StorageTokenId });


  }

  


  

  ngOnDestroy(){
    this.unsubscribeChain?.unsubscribe();
  }

  public get cartTotal(){
    if(!this.cart || this.cart.length==0){
      return 0
    }
    return this.cart?.filter(f=>f.quantity > 0)
      .map(m=>m.price * m.quantity)
      .reduce((prev, curr)=>{
        return prev + curr
      }, 0)

  }


  public  get  cartTotalUSDT(){

    return this.cartTotal * this.rates.USDT

  }

  public get cartTotalNEAR(){
    return this.cartTotal * this.rates.NEAR

  }

  public get cartQuantity(){
    if(!this.cart || this.cart.length==0){
      return 0
    }
    return this.cart?.filter(f=>f.quantity > 0)
      .map(m=> m.quantity)
      .reduce((prev, curr)=>{
        return prev + curr
      }, 0)

  }

  removeFromCart(product: any){
    product.quantity--;
    if(product.quantity<0){
      product.quantity=0;
    }
  }

  addToCart(product: any){
    product.quantity++;
  }

  getPriceInCurrency(currency: 'CUSD'|'USDT'|'NGN'|'CELO', amt: number){
    if(currency == 'CELO'){
      return amt * this.rates.CELO;
    }
    else if(currency == 'CUSD' || currency == 'USDT'){
      return amt * this.rates.USDT;
    }else{
      return amt ;
    }
  }




  async checkout(currency: any){

    this.spinner.show();


    const orderedItems = this.cart?.filter(f=>f.quantity > 0)
      .map(c=>{
        return {
          ...c,
          totalPrice:   c.quantity * c.price,
          totalPriceInUserCurrency:  this.getPriceInCurrency(currency, c.quantity * c.price)
        }
      })

    const order = {
      date: new Date(),
      total: orderedItems?.map(m=>m.totalPrice).reduce((p,c)=>p+c, 0),
      totalInUserCurrency: parseUnits(''+ orderedItems?.map(m=>m.totalPriceInUserCurrency).reduce((p,c)=>p+c, 0) , currency=='USDT'?6:18 ),
      orderedItems,
      currency,
      tokenAddress: paymentCurrencies[this.w3s.chainId!][currency]
    }
    const blob = new Blob([JSON.stringify({order})], { type: 'application/json' })
    const orderMetadataFile = new File([blob], 'order.json')


    const nftReceipt =  {
      name: "Storefront Receipt",
      description: "Receipt.",
      image: "https://picsum.photos/id/20/400/400",
      attributes: orderedItems?.map(m=>{
        return {
          "trait_type": m.productName,
          "value": m.quantity
        }
      })
    }

    const timeStamp = this.w3s.account! + new Date().getTime()
    const nftMetadataFile = new File(
      [new Blob([JSON.stringify({nftReceipt})], 
      { type: 'application/json' })], `nft.json`)

    const allFiles = [ orderMetadataFile, nftMetadataFile]
    
    // const ipfsCid = await this.web3StorageClient?.put(allFiles, {
    //   name: 'StoreFront Order - Store '+ this.posAddress,
    // });

    const ipfsCid = await this.ipfsService?.uploadDirectory(allFiles);


    try {
      
      const publicClient = await getPublicClient(wagmiConfig)
      
      const hash = await writeContract(wagmiConfig, {
        abi: POSABI,
        address: this.posAddress as `0x${string}`,
        functionName: 'startOrder',
        args: [
          ipfsCid?.toString()??'',
          order.tokenAddress, 
          order.totalInUserCurrency,
          0
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

        logs = await parseEventLogs(provider, hash,['event OrderCreated( uint indexed orderId, string orderMetadataUrl, address indexed token, uint amount)'], 'OrderCreated')

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
          event: parseAbiItem('event OrderCreated( uint indexed orderId, string orderMetadataUrl, address indexed token, uint amount)'),
        });

        //@ts-ignore
        logs = await getFilterLogs(publicClient, {filter: filter})
      }

      

      // console.log('logs', logs)
      
      const orderId = logs[0]['args']['orderId'].toString()

      // console.log('orderId:', orderId)

      this.spinner.hide()
      this.toastService.show('Order Created', 'Order Started successfully!')
      this.router.navigate(['/complete-order',this.posAddress, orderId]);
    } catch (error) {
      console.error(error)
      this.spinner.hide()
      this.toastService.error('Failed', 'Order Failed!')
      
    }
  }
}
