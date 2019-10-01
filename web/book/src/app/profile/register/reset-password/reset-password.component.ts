import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { RegisterService } from '../services/register.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent {
  @Input() login: string;
  @Input() code: number;
  @Output() passwordEnter: EventEmitter<void> = new EventEmitter();

  form: FormGroup;
  constructor(
    private registerService: RegisterService,
    private toastr: ToastrService,
  ) {
    this.form = new FormGroup({
      password: new FormControl('',  [Validators.required, Validators.minLength(5)]),
      password2: new FormControl(''),
    }, (fg: FormGroup) => {
      if (fg.get('password').value !== fg.get('password2').value) {
        return {
          password2: true
        };
      }
      return null;
    });
  }

  submitPassword() {
    if (this.form.invalid) {
      return false;
    }

    const password = this.form.get('password').value;

    this.registerService.resetPassword(this.login, password, this.code).subscribe(() => {
      this.toastr.success('Регистрация завершена!');
      this.passwordEnter.emit();
    }, () => {
      this.toastr.error('Ошибка при назначении пароля');
    });
  }
}
