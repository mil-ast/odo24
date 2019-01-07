import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ServicesComponent } from './services.component';
import { MatSnackBarModule, MatProgressSpinnerModule } from '@angular/material';
import { AvtoService } from '../_services/avto.service';
import { SelectedAvtoModule } from '../shared/selected-avto/selected-avto.module';
import { ItemAvtoModule } from '../shared/item-avto/item-avto.module';

@NgModule({
  declarations: [
    ServicesComponent,
  ],
  imports: [
    CommonModule,
    SelectedAvtoModule,
    ItemAvtoModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
  ],
  providers: [
    AvtoService,
  ]
})
export class ServiceModule {}
