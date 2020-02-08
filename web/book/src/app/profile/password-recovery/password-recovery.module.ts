import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PasswordRecoveryRoutingModule } from './password-recovery.router';
import { PasswordRecoveryComponent } from './password-recovery.component';
import { EnterLoginComponent } from './enter-login/enter-login.component';
import { RecoveryService } from './services/recovery.service';
import { ConfirmCodeComponent } from './confirm-code/confirm-code.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  imports: [
    CommonModule,
    PasswordRecoveryRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    MatInputModule,
    MatButtonModule,
  ],
  declarations: [
    PasswordRecoveryComponent,
    EnterLoginComponent,
    ConfirmCodeComponent,
    ResetPasswordComponent,
  ],
  providers: [
    RecoveryService,
  ],
  exports: [
  ]
})
export class PasswordRecoveryModule { }
