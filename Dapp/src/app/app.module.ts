import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { W3mButtonComponent } from './w3m-button/w3m-button.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {HttpClientModule} from '@angular/common/http';
import { SignupComponent } from './signup/signup.component';
import { HomeComponent } from './home/home.component';
// import { MyFileDropZoneComponent } from './my-file-drop-zone/my-file-drop-zone.component';
// import { DropzoneCdkModule } from '@ngx-dropzone/cdk';
import { NgxFileDropModule } from 'ngx-file-drop';
import { SellComponent } from './sell/sell.component';
import { NgxSpinnerModule } from 'ngx-spinner';
import { CompleteOrderComponent } from './complete-order/complete-order.component';
import { ToastsComponent } from './toasts/toasts.component';
import { CompletedComponent } from './completed/completed.component';
import { StoreListComponent } from './store-list/store-list.component';
import { StoreListItemComponent } from './store-list-item/store-list-item.component';


@NgModule({
  declarations: [
    AppComponent,
    W3mButtonComponent,
    SignupComponent,
    HomeComponent,
    SellComponent,
    CompleteOrderComponent,
    ToastsComponent,
    CompletedComponent,
    StoreListComponent,
    StoreListItemComponent
    // MyFileDropZoneComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    NgbModule,
    FormsModule,
    ReactiveFormsModule,
    // DropzoneCdkModule,
    HttpClientModule,
    NgxFileDropModule ,
    NgxSpinnerModule.forRoot({ type: 'ball-scale-multiple' })
    
  ],
  providers: [],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule { }
