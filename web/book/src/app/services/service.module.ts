import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ServicesComponent } from './services.component';
import { MatSnackBarModule, MatProgressSpinnerModule } from '@angular/material';
import { AvtoService } from '../_services/avto.service';
import { SelectedAvtoModule } from '../shared/selected-avto/selected-avto.module';

@NgModule({
  declarations: [
    ServicesComponent,
  ],
  imports: [
    CommonModule,
    SelectedAvtoModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
  ],
  providers: [
    AvtoService,
  ]
})
export class ServiceModule {}
