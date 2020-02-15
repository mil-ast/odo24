import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DocumentsComponent } from './documents.component';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { DocumentsRoutingModule } from './documents.routing';
import { SharedUtilsModule } from '../shared_modules/utils/shared-utils.modue';



@NgModule({
  declarations: [
    DocumentsComponent,
  ],
  imports: [
    CommonModule,
    DocumentsRoutingModule,
    MatButtonModule,
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    SharedUtilsModule,
  ]
})
export class DocumentsModule { }
