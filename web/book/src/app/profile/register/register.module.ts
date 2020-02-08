import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RegisterComponent } from './register.component';
import { RegisterRoutingModule } from './register.router';
import { RegisterService } from './services/register.service';
import { ConfirmCodeComponent } from './confirm-code/confirm-code.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { NewLoginComponent } from './new-login/new-login.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';

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
