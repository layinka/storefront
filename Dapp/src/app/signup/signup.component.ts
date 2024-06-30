import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { getWalletClient, getPublicClient, fetchTransaction, writeContract, waitForTransaction } from '@wagmi/core';
import { ethers } from 'ethers';
import { NgxFileDropEntry } from 'ngx-file-drop';
import { NgxSpinnerService } from 'ngx-spinner';
import { combineLatest, Subscription } from 'rxjs';

import { AppToastService } from 'src/app/services/app-toast.service';

import { Web3Service, wagmiConfig } from 'src/app/services/web3.service';
import { delay } from 'src/app/utils/delay';
import { environment } from 'src/environments/environment';
import { zeroAddress, parseAbiItem } from 'viem';

import { getFilterLogs, createEventFilter } from 'viem/actions';
import { celoAlfajores } from 'viem/chains';
import { Web3Storage } from 'web3.storage';
import contracts from '../models/contracts';
import { getEthersSigner, publicClientToProvider } from '../utils/ethers-wagmi-adapter';
import parseEventLogs from '../utils/parseEventLogs';
import { IpfsService } from '../services/ipfs.service';


const POSFactoryABI = require( "../../assets/abis/pos-factory.json");




@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent {
  
  contract: any; // Update the type according to your contract
  connected: boolean = false;
 
  unsubscribeChain?: Subscription;
  
  registrationForm: FormGroup;

  isRegistered = false
  
  p2pContract: any;
  

  // web3StorageClient? : Web3Storage;

  constructor(private formBuilder: FormBuilder,
    public w3s: Web3Service,
    private route: ActivatedRoute,
    private router: Router,
    private spinner: NgxSpinnerService,
    private toastService: AppToastService,
    private ipfsService: IpfsService
  ) {

      this.registrationForm = this.formBuilder.group({
        name: ['', Validators.required],
        // email: ['', [Validators.required, Validators.email]],
        paymentAddress: ['account', [Validators.required, Validators.maxLength(42)]],
        files: new FormArray([
          // new FormGroup({
          //   name: new FormControl('', [Validators.required, Validators.maxLength(120)]),
          //   price: new FormControl('', [Validators.required, Validators.min(0.0001)]),
          //   // image: new FormControl('', [Validators.required])
          // })
        ],  {validators: undefined})
      });
  }

  ngOnInit(): void {
    this.unsubscribeChain =  combineLatest([this.w3s.chainId$, this.w3s.account$]).subscribe(async ([chainId, account])=>{
      if( !chainId || !account) return;

      this.registrationForm = this.formBuilder.group({
        name: ['', Validators.required],
        // email: ['', [Validators.required, Validators.email]],
        paymentAddress: [account, [Validators.required, Validators.maxLength(42)]],
        files: new FormArray([
          new FormGroup({
            name: new FormControl('Ralph Lauren Polo Blue', [Validators.required, Validators.maxLength(120)]),
            price: new FormControl(0, [Validators.required, Validators.min(0.0001)]),
            imagePreviewUrl: new FormControl('https://fragrances.com.ng/media/catalog/product/cache/3f352caa9845cb86b827745a9fdca65c/r/a/ralph_lauren_polo_blue_parfum_125ml.jpeg', [Validators.required]),
          }),
          new FormGroup({
            name: new FormControl('Lattafa Pride Affection', [Validators.required, Validators.maxLength(120)]),
            price: new FormControl(0, [Validators.required, Validators.min(0.0001)]),
            imagePreviewUrl: new FormControl('https://fragrances.com.ng/media/catalog/product/cache/3f352caa9845cb86b827745a9fdca65c/l/a/lattafa_pride_affection_edp_100ml_copy.jpg', [Validators.required]),
          })
          
        ],  {validators: undefined})
      });


    })

    

    // Construct with token and endpoint
    // this.web3StorageClient = new Web3Storage({ token: environment.web3StorageTokenId });
    
  }

  ngOnDestroy(){
    this.unsubscribeChain?.unsubscribe();
  }

  public ngxFileList: NgxFileDropEntry[] = [];

  public productPictureFiles: any = [] // Real files filtered by isFile property

  public onFileDropped(files: NgxFileDropEntry[]) {
    const extensionsAllowed = [
      '.jpg',
      '.jpeg',
      '.png'
    ]
    this.ngxFileList = files;
    this.productPictureFiles=[];
    for (const droppedFile of files) {

      // Is it a file?
      if (droppedFile.fileEntry.isFile) {
        const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;
        fileEntry.file((file: File) => {

          // if(!extensionsAllowed.some(ext=>file.name.endsWith(ext))) {
          //   return
          // }
          let fileExtension ;
          for (let i = 0; i < extensionsAllowed.length; i++) {
            const ext = extensionsAllowed[i];
            if(file.name.toLowerCase().endsWith(ext)){
              fileExtension=ext;
              break;
            }
            
          }

          if(!fileExtension){
            return; // wrong file extension
          }

          // Here you can access the real file
          console.log(droppedFile.relativePath, file);

          let productPictureFile = {
            file: file,
            relativePath: droppedFile.relativePath,
            imagePreviewUrl: '',
            fileExtension
          }
          // File Preview
          const reader = new FileReader();
          reader.onload = () => {
            productPictureFile.imagePreviewUrl = reader.result as string;
          }
          reader.readAsDataURL(file)
          
          this.productPictureFiles.push(productPictureFile)
          
          this.addFileNamePairToForm(file.name.substring(0,file.name.length - fileExtension.length));

          

          /**
          // You could upload it like this:
          const formData = new FormData()
          formData.append('logo', file, relativePath)

          // Headers
          const headers = new HttpHeaders({
            'security-token': 'mytoken'
          })

          this.http.post('https://mybackend.com/api/upload/sanitize-and-save-logo', formData, { headers: headers, responseType: 'blob' })
          .subscribe(data => {
            // Sanitized logo returned from backend
          })
          **/

        });
      } else {
        // It was a directory (empty directories are added, otherwise only files)
        const fileEntry = droppedFile.fileEntry as FileSystemDirectoryEntry;
        console.log(droppedFile.relativePath, fileEntry);
      }
    }
  }

  get fileFormArray() {
    return this.registrationForm?.get('files') as FormArray;
  }

  addFileNamePairToForm(name: string) {
    const group = new FormGroup({
      name: new FormControl(name, [Validators.required, Validators.maxLength(120)]),
      price: new FormControl(0, [Validators.required, Validators.min(0.0001)]),
      imagePreviewUrl: new FormControl('', [Validators.required]),
    });

      this.fileFormArray.push(group);
  }

  removeFileNamePairToForm(index: number) {
    this.fileFormArray.removeAt(index);
  }

  addNewItem(){
    const group = new FormGroup({
      name: new FormControl('', [Validators.required, Validators.maxLength(120)]),
      price: new FormControl(0, [Validators.required, Validators.min(0.0001)]),
      imagePreviewUrl: new FormControl('', [Validators.required]),
    });

      this.fileFormArray.push(group);
  }
  

  
  
  // convenience getter for easy access to form fields
  get f() { return this.registrationForm?.controls; }
  
  async submit(event: Event) {
    event.preventDefault();

    
    if (!this.registrationForm || this.registrationForm.invalid) {
      // Form validation failed
      return;
    }

    this.spinner.show()

    // Registration logic here
    // Access form values using this.registrationForm.value

    //upload products pictures to IPFS
    let products = []
    // const filesForUpload = []
    // for (let i = 0; i < this.productPictureFiles.length; i++) {
    //   // const file = this.productPictureFiles[i].file;
    //   // const newFileName = `${i}${this.productPictureFiles[i].fileExtension}`
    //   // const newFile = new File([file], newFileName, {type: file.type});     
    //   // filesForUpload.push(newFile)
    //   products.push({
    //     productName: this.fileFormArray.controls[i].get('name')?.value,
    //     price:  this.fileFormArray.controls[i].get('price')?.value,
    //     image: this.fileFormArray.controls[i].get('imagePreviewUrl')?.value //,'/'+newFileName
    //   })
    // }
    for (let i = 0; i < this.fileFormArray.controls.length; i++) {
      // const file = this.productPictureFiles[i].file;
      // const newFileName = `${i}${this.productPictureFiles[i].fileExtension}`
      // const newFile = new File([file], newFileName, {type: file.type});     
      // filesForUpload.push(newFile)
      products.push({
        productName: this.fileFormArray.controls[i].get('name')?.value,
        price:  this.fileFormArray.controls[i].get('price')?.value,
        image: this.fileFormArray.controls[i].get('imagePreviewUrl')?.value //,'/'+newFileName
      })
    }
    const blob = new Blob([JSON.stringify({products})], { type: 'application/json' })
    const productMetadataFile = new File([blob], `${this.w3s.account}/product-metadata.json`)
    // const allFiles = [...filesForUpload, productMetadataFile]
    const allFiles = [ productMetadataFile]
    
    // const ipfsCid = await this.web3StorageClient?.put(allFiles, {
    //   name: this.w3s.account,
    // });

    const ipfsCid = await this.ipfsService.uploadDirectory(allFiles).catch((err)=>{
      console.error('Error uploading', err)
    })
    
    console.log('CID: ', ipfsCid,' - ', `https://${ipfsCid}.ipfs.w3s.link`)
     
    try {
      const walletClient  = await getWalletClient(wagmiConfig, {
        chainId: this.w3s.chainId
      })
      const publicClient = await getPublicClient(wagmiConfig,{
        chainId: this.w3s.chainId
      })
      
      const account = walletClient?.account;// await walletClient!.getAddresses()
      
      // const signer = await getEthersSigner({chainId: celoAlfajores.id})
      // const ethContract = new ethers.Contract(contracts[this.w3s.chainId??31337] ,POSFactoryABI,signer)

      // let tx = await ethContract.createPOS(this.f?.name.value, 
      //   this.f?.paymentAddress.value,
      //   ipfsCid,
      //   {
      //     feeCurrency: '0x874069fa1eb16d44d622f2e0ca25eea172369bc1'
      //   }
      //   );
      // let txResult = await tx.wait();  
      
      // let posCreatedLog = txResult.events.filter((f: any)=>f.event=='POSCreated')[0];
      // let posAddress1 = posCreatedLog.args['posAddress'].toString();

      // this.spinner.hide()
      // this.toastService.show('StoreFront Created', 'Store Front Created successfully!')
      // this.router.navigate(['/sell', posAddress1]);
      // return;



      const hash = await writeContract(wagmiConfig,{
        abi: POSFactoryABI,
        address: contracts[this.w3s.chainId??31337] as `0x${string}`,
        functionName: 'createPOS',
        account: account?.address,
        args: [
          this.f?.name.value, 
          this.f?.paymentAddress.value,
          ipfsCid?.toString()??''
        ],
        // chain: this.w3s.chainId
      })

      const txReceipt = await waitForTransaction( 
        wagmiConfig,
        { hash: hash }
      )

      await delay(2000);

      console.log('txReceipt:', txReceipt)

      if(txReceipt.status== 'success'){
        // Get the auctionid
        const publicClient = getPublicClient(wagmiConfig);

        if(this.w3s.chainId!=31337){// eth_filter not supported
          const provider = publicClientToProvider(publicClient!)

          let eventLog = await parseEventLogs(provider, hash,['event POSCreated(address merchant, address posAddress)'], 'POSCreated')

          console.log(eventLog)

          const posAddress1 = eventLog[0].args['posAddress']

          this.spinner.hide()
          this.toastService.show('Sales Point Created', 'Sales Point Created successfully!')
          this.router.navigate(['/sell', posAddress1]);
          return;
        }

        //@ts-ignore
        const filter = await createEventFilter(publicClient, {
          address: contracts[this.w3s.chainId??31337] as `0x${string}`,
          event: parseAbiItem('event POSCreated(address merchant, address posAddress)'),
        });

        //@ts-ignore
        const logs = await getFilterLogs(publicClient, {filter: filter})

        console.log('logs:', logs) 
        const posAddress = logs[0]['args']['posAddress']

        console.log('posAddress:', posAddress)

        this.spinner.hide()
        this.toastService.show('Sales Point Created', 'Sales Point Created successfully!')
        this.router.navigate(['/sell', posAddress]);
        return;
      }else{
        alert('Error Creating Sales Point')
      }


      
      
    } catch (error) {
      
      console.error('error:', error)
    }

    this.spinner.hide()
      this.toastService.error('Failed', 'Sales Point Creation Failed!')
  }

  
}

