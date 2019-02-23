import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RemindingComponent } from './reminding.component';
import { RemindingRoutingModule } from './reminding.router.module';

@NgModule({
  declarations: [
    RemindingComponent,
  ],
  imports: [
    CommonModule,
    RemindingRoutingModule,
  ],
})
export class RemindingModule { }
