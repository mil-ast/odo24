import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  MatButtonModule,
  MatFormFieldModule,
  MatIconModule,
  MatInputModule,
  MatCardModule,
  MatGridListModule,
} from '@angular/material';
import { CommonModule } from '@angular/common';
import { RegisterComponent } from './register.component';
import { RegisterRoutingModule } from './register.router';
import { RegisterService } from './services/register.service';
import { ConfirmCodeComponent } from './confirm-code/confirm-code.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { NewLoginComponent } from './new-login/new-login.component';

@NgModule({
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatGridListModule,
    HttpClientModule,
    FormsModule,
    CommonModule,
    ReactiveFormsModule,
    RegisterRoutingModule,
  ],
  declarations: [
    RegisterComponent,
    ConfirmCodeComponent,
    ResetPasswordComponent,
    NewLoginComponent,
  ],
  providers: [
    RegisterService,
  ]
})
export class RegisterModule { }
