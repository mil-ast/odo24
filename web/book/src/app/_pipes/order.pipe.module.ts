import { NgModule } from '@angular/core';
import { OrderPipe } from './order.pipe';

@NgModule({
  declarations: [
    OrderPipe,
  ],
  exports: [
    OrderPipe,
  ]
})
export class OrderPipeModule { }
