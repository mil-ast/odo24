import { NgModule } from '@angular/core';
import { ProfileRoutingModule } from './profile.router';
import { MatIconModule, MatCardModule, MatDividerModule, MatFormFieldModule, MatInputModule, MatButtonModule } from '@angular/material';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@NgModule({
  imports: [
    ProfileRoutingModule,
    FormsModule,
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    MatCardModule,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  declarations: [
    
  ],
  providers: [
    
  ],
  exports: [
  ]
})
export class ProfileModule { }
