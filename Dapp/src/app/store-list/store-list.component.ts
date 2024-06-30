import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { readContract } from '@wagmi/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription, combineLatest } from 'rxjs';
import { Web3Storage } from 'web3.storage';
import contracts from '../models/contracts';
import { AppToastService } from '../services/app-toast.service';
import { Web3Service, wagmiConfig } from '../services/web3.service';

const POSFactoryABI = require( "../../assets/abis/pos-factory.json");
const POSABI = require( "../../assets/abis/pos.json");

@Component({
  selector: 'app-store-list',
  templateUrl: './store-list.component.html',
  styleUrls: ['./store-list.component.scss']
})
export class StoreListComponent {
  contract: any; // Update the type according to your contract
  connected: boolean = false;
 
  unsubscribeChain?: Subscription;
  
  registrationForm?: FormGroup;

  isRegistered = false
  
  p2pContract: any;
  alreadyRegistered = false;

  stores: any

  web3StorageClient? : Web3Storage;

  constructor(private formBuilder: FormBuilder,
    public w3s: Web3Service,
    private route: ActivatedRoute,
    private router: Router,
    private spinner: NgxSpinnerService,
    private toastService: AppToastService) {

    
  }

  ngOnInit(): void {
    this.unsubscribeChain =  combineLatest([this.w3s.chainId$, this.w3s.account$]).subscribe(async ([chainId, account])=>{
      if(( !chainId || !account)) return;

      this.stores = (await readContract(wagmiConfig,{
        address: contracts[this.w3s.chainId??31337] as `0x${string}`,
        abi: POSFactoryABI,
        functionName: 'getOwnerPOSAddresses',
        args: [this.w3s.account!]
      })   ) as any

      
    })

    
  }
}
