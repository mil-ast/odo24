import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ItemAvtoComponent } from './item-avto.component';
import {
  MatMenuModule,
  MatIconModule,
  MatButtonModule,
  MatDialogModule,
  MatInputModule,
  MatSnackBarModule,
  MatProgressBarModule
} from '@angular/material';
import { DialogUpdateAvtoComponent } from 'src/app/services/dialogs/dialog-update-avto/dialog-update-avto.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';

@NgModule({
  declarations: [
    ItemAvtoComponent,
    DialogUpdateAvtoComponent,
    ConfirmationDialogComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatMenuModule,
    MatDialogModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatSnackBarModule,
    MatProgressBarModule,
  ],
  exports: [
    ItemAvtoComponent,
  ],
  entryComponents: [
    DialogUpdateAvtoComponent,
    ConfirmationDialogComponent,
  ]
})
export class ItemAvtoModule { }
