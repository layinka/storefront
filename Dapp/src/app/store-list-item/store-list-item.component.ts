import { Component, Input } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription, combineLatest } from 'rxjs';
import { readContract } from '@wagmi/core';
import { Web3Storage } from 'web3.storage';
import contracts from '../models/contracts';
import { AppToastService } from '../services/app-toast.service';
import { Web3Service, wagmiConfig } from '../services/web3.service';

const POSFactoryABI = require( "../../assets/abis/pos-factory.json");
const POSABI = require( "../../assets/abis/pos.json");

@Component({
  selector: '[store-list-item]',
  templateUrl: './store-list-item.component.html',
  styleUrls: ['./store-list-item.component.scss']
})
export class StoreListItemComponent {
 
  unsubscribeChain?: Subscription;

  @Input() index: any
  @Input() posAddress: string = ''

  storeName?: string;

  constructor(public w3s: Web3Service) {

    
  }

  ngOnInit(): void {
    this.unsubscribeChain =  combineLatest([this.w3s.chainId$, this.w3s.account$]).subscribe(async ([chainId, account])=>{
      if(( !chainId || !account)) return;

      this.storeName = (await readContract(wagmiConfig, {
        address: this.posAddress as `0x${string}`,
        abi: POSABI,
        functionName: 'name',
        args: []
      })   ) as any

      
    })

    
  }
}
