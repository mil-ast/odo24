import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DocumentsComponent } from './documents.component';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { DocumentsRoutingModule } from './documents.routing';
import { SharedUtilsModule } from '../shared_modules/utils/shared-utils.modue';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ItemDocumentComponent } from './item-document/item-document.component';
import { DocumentsService } from './services/documents.service';
import { MatDividerModule } from '@angular/material/divider';
import { DocTypeIconPipe } from './pipes/doc-type-icon.pipe';
import { MatMenuModule } from '@angular/material/menu';
import { DialogCreateDocumentComponent } from './dialogs/dialog-create-document/dialog-create-document.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatRadioModule } from '@angular/material/radio';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

@NgModule({
  declarations: [
    DocumentsComponent,
    ItemDocumentComponent,
    DocTypeIconPipe,
    DialogCreateDocumentComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    DocumentsRoutingModule,
    MatButtonModule,
    MatSidenavModule,
    MatToolbarModule,
    MatSlideToggleModule,
    MatIconModule,
    MatDividerModule,
    MatMenuModule,
    MatDialogModule,
    MatRadioModule,
    MatDatepickerModule,
    MatInputModule,
    MatSelectModule,
    SharedUtilsModule,
  ],
  providers: [
    DocumentsService,
  ],
  entryComponents: [
    DialogCreateDocumentComponent,
  ]
})
export class DocumentsModule { }
