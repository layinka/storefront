import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CompleteOrderComponent } from './complete-order/complete-order.component';
import { CompletedComponent } from './completed/completed.component';
import { HomeComponent } from './home/home.component';
import { SellComponent } from './sell/sell.component';
import { SignupComponent } from './signup/signup.component';
import { StoreListComponent } from './store-list/store-list.component';

const routes: Routes = [
  {path: '', component: HomeComponent},
  {path: 'create-sales-point', component: SignupComponent},
  {path: 'sell/:a', component: SellComponent},
  {path: 'complete-order/:a/:id', component: CompleteOrderComponent},
  {path: 'completed/:a/:id/:rid', component: CompletedComponent},
  {path: 'stores', component: StoreListComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
