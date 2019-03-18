import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RemindingComponent } from './reminding.component';
import { RemindingRoutingModule } from './reminding.router.module';
import { SelectedAvtoModule } from '../shared/selected-avto/selected-avto.module';
import { ItemRemindComponent } from './item-remind/item-remind.component';
import { OrderPipeModule } from '../_pipes/order.pipe.module';
import { DialogCreateDocComponent } from './dialogs/dialog-create-doc/dialog-create-doc.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import {
  MatInputModule,
  MatDialogModule,
  MatDatepickerModule,
  MatButtonModule,
  MatSelectModule, MatMenuModule,
  MatIconModule
} from '@angular/material';
import { RemindingService } from './services/reminding.service';
import { DialogUpdateDocComponent } from './dialogs/dialog-update-doc/dialog-update-doc.component';

@NgModule({
  declarations: [
    RemindingComponent,
    ItemRemindComponent,
    DialogCreateDocComponent,
    DialogUpdateDocComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RemindingRoutingModule,
    SelectedAvtoModule,
    OrderPipeModule,
    FormsModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDialogModule,
    MatMenuModule,
    MatIconModule,
    MatDatepickerModule,
  ],
  entryComponents: [
    DialogCreateDocComponent,
    DialogUpdateDocComponent,
  ],
  providers: [
    RemindingService,
  ]
})
export class RemindingModule { }
