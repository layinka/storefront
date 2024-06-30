import { Component } from '@angular/core';
import { DropzoneComponent } from "@ngx-dropzone/cdk";

@Component({
  selector: 'file-drop-zone',
  templateUrl: './my-file-drop-zone.component.html',
  styleUrls: ['./my-file-drop-zone.component.scss']
})
export class MyFileDropZoneComponent extends DropzoneComponent {

}

