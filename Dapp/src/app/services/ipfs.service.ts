import { Injectable } from '@angular/core';
import { create } from '@web3-storage/w3up-client'
import { Client, FileLike } from '@web3-storage/w3up-client/dist/src/types';
import { environment } from 'src/environments/environment';

// const w3upClient = await create()

@Injectable({
  providedIn: 'root'
})
export class IpfsService {

  w3upClient!: Client;

  constructor() {
    create().then((client)=>{
      this.w3upClient=client

      try {
        this.w3upClient.login(environment.ipfsEmail as any).then((acct)=>{
          // console.log('w3up logged in')
          this.w3upClient.setCurrentSpace(environment.ipfsSpaceDid as any).then(async ()=>{
            //w3upClient.addSpace(w3upClient.currentSpace()?.name
            // console.log('w3up spaced in')
          })
        })
      } catch (err) {
        console.error('registration failed: ', err)
      }
    }).catch((err)=>{
      console.error('error creating w3up client: ', err)
    })
    
    
  }

  /**
   * You can control the directory layout and create nested directory structures by using / delimited paths in your filenames:

    const files = [
      new File(['some-file-content'], 'readme.md'),
      new File(['import foo'], 'src/main.py'),
      new File([someBinaryData], 'images/example.png')
    ]
   * @param files 
   * @returns 
   * 
   */
  async uploadDirectory(files: FileLike[]){
    const directoryCid = await this.w3upClient.uploadDirectory(files, {

    })
    return directoryCid;
  }

  async uploadFile(file: FileLike){
    const cid = await this.w3upClient.uploadFile(file)
    return cid;
  }
}
