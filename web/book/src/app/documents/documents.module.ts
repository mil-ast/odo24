import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SelectedAvtoModule } from '../shared/selected-avto/selected-avto.module';
import { ItemRemindComponent } from './item-remind/item-remind.component';
import { OrderPipeModule } from '../_pipes/order.pipe.module';
import { DialogCreateDocComponent } from './dialogs/dialog-create-doc/dialog-create-doc.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { DocumentsService } from './services/documents.service';
import { DialogUpdateDocComponent } from './dialogs/dialog-update-doc/dialog-update-doc.component';
import { DocumentsComponent } from './documents.component';
import { DocumentsRoutingModule } from './documents.router.module';

@NgModule({
  declarations: [
    DocumentsComponent,
    ItemRemindComponent,
    DialogCreateDocComponent,
    DialogUpdateDocComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DocumentsRoutingModule,
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
    MatProgressBarModule,
  ],
  entryComponents: [
    DialogCreateDocComponent,
    DialogUpdateDocComponent,
  ],
  providers: [
    DocumentsService,
  ]
})
export class DocumentsModule { }
