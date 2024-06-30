import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription, combineLatest, lastValueFrom } from 'rxjs';
import { formatUnits } from 'viem';
import { readContract } from '@wagmi/core';
import { AppToastService } from '../services/app-toast.service';
import { Web3Service, chainList, wagmiConfig } from '../services/web3.service';
import { formatIPFS_CID_ToGatewayUrl } from '../utils/ipfs';
import { storeFrontNFT } from '../models/contracts';


const POSFactoryABI = require( "../../assets/abis/pos-factory.json");
const POSABI = require( "../../assets/abis/pos.json");

@Component({
  selector: 'app-completed',
  templateUrl: './completed.component.html',
  styleUrls: ['./completed.component.scss']
})
export class CompletedComponent {
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
  tokenReceiptId: any
  storeName: any

  nftAddress: any

  blockExplorerUrl: any;


  constructor(public  w3s: Web3Service,
    private route: ActivatedRoute,
    private router: Router,
    private spinner: NgxSpinnerService,
    private toastService: AppToastService,
    private httpClient: HttpClient){
    
  }

  async ngOnInit(){

    
        
    this.unsubscribeChain =  combineLatest([this.route.params, this.w3s.chainId$, this.w3s.account$]).subscribe(async ([params,chainId, account])=>{
      if(!chainId || !account) return;

      

      this.posAddress = params['a'];
      this.id = params['id'];
      this.tokenReceiptId = +params['rid'];
      
      if(!this.posAddress || !this.id){
        this.router.navigate(['/']);
      }

      this.nftAddress=storeFrontNFT[chainId!]
      
      const explorer =chainList.find((f: any)=>f.id==chainId)?.blockExplorers?.default?.url
      if(explorer){
        this.blockExplorerUrl = `${explorer}/token/${this.nftAddress}/token-transfers`;
      }
      
      
      

      this.storeName = (await readContract(wagmiConfig,{
        address: this.posAddress as `0x${string}`,
        abi: POSABI,
        functionName: 'name',
        args: []
      })   ) as any

      const [metadataUrl,amount, token, paid] = (await readContract( wagmiConfig,{
        address: this.posAddress as `0x${string}`,
        abi: POSABI,
        functionName: 'getOrderDetails',
        args: [this.id]
      })   ) as any
      

      this.orderDetails = {
        metadataUrl: formatIPFS_CID_ToGatewayUrl(metadataUrl??''),
        amount, token, paid
      }
      
      
      const r: any = await lastValueFrom(this.httpClient.get(this.orderDetails.metadataUrl + '/order.json'))
      this.orderMetadata = r.order
      

      this.cart=[]
      for(let i=0; i< this.orderMetadata.orderedItems.length; i++){
        this.cart?.push({
          
          ...this.orderMetadata.orderedItems[i],
          image: this.orderMetadata.orderedItems[i].image // `${this.ipfsBaseUrl}${this.orderMetadata.orderedItems[i].image}` 
        })
      }
      this.total = this.orderMetadata.total
      this.totalInUserCurrency = formatUnits( this.orderMetadata.totalInUserCurrency, this.orderMetadata.currency=='USDT'?6:18)
      this.tokenAddress = this.orderMetadata.tokenAddress
      this.currency=this.orderMetadata.currency

           
      
    })

  }
}
