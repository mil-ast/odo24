import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ServicesComponent } from './services.component';
import {
  MatSnackBarModule,
  MatProgressSpinnerModule,
  MatProgressBarModule,
  MatDialogModule,
  MatButtonModule,
  MatInputModule,
  MatIconModule,
  MatMenuModule,
  MatDatepickerModule,
  MatCardModule } from '@angular/material';
import { AvtoService } from '../_services/avto.service';
import { SelectedAvtoModule } from '../shared/selected-avto/selected-avto.module';
import { GroupService } from '../_services/groups.service';
import { ItemServiceComponent } from './item-service/item-service.component';
import { ServiceService } from '../_services/service.service';
import { DialogCreateAvtoComponent } from '../app_components/dialog-create-avto/dialog-create-avto.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DialogCreateServiceComponent } from './dialogs/dialog-create-service/dialog-create-service.component';
import { DialogUpdateServiceComponent } from './dialogs/dialog-update-service/dialog-update-service.component';
import { OrderPipeModule } from '../_pipes/order.pipe.module';

@NgModule({
  declarations: [
    ServicesComponent,
    ItemServiceComponent,
    DialogCreateAvtoComponent,
    DialogCreateAvtoComponent,
    DialogCreateServiceComponent,
    DialogUpdateServiceComponent,
  ],
  imports: [
    CommonModule,
    SelectedAvtoModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatDialogModule,
    MatButtonModule,
    MatInputModule,
    MatIconModule,
    MatMenuModule,
    MatCardModule,
    MatDatepickerModule,
    FormsModule,
    ReactiveFormsModule,
    OrderPipeModule,
  ],
  providers: [
    AvtoService,
    GroupService,
    ServiceService,
  ],
  entryComponents: [
    DialogCreateAvtoComponent,
    DialogCreateServiceComponent,
    DialogUpdateServiceComponent,
  ]
})
export class ServiceModule {}
