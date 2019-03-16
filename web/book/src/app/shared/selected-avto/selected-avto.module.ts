import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SelectedAvtoComponent } from './selected-avto.component';
import { MatButtonModule, MatMenuModule, MatIconModule } from '@angular/material';

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
