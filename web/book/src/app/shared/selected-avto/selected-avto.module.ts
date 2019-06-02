import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SelectedAvtoComponent } from './selected-avto.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';

@NgModule({
  declarations: [
    SelectedAvtoComponent,
  ],
  imports: [
    CommonModule,
    MatButtonModule,
    MatMenuModule,
    MatIconModule,
  ],
  exports: [
    SelectedAvtoComponent,
  ]
})
export class SelectedAvtoModule { }
