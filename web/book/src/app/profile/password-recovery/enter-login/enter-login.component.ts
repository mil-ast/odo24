import { Component, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { RecoveryService } from '../services/recovery.service';

@Component({
  selector: 'app-enter-login',
  templateUrl: './enter-login.component.html',
  styleUrls: ['./enter-login.component.css']
})
export class EnterLoginComponent {
  @Output() loginEnter: EventEmitter<string> = new EventEmitter();
  form: FormGroup;
  
  constructor(
    private recoverService: RecoveryService,
    private toastr: ToastrService,
  ) {
    this.form = new FormGroup({
      login: new FormControl('', [Validators.required, Validators.email]),
    });
  }

  submitLogin() {
    if (this.form.invalid) {
      return false;
    }

    const login = this.form.get('login').value;

    this.recoverService.recoverLogin(login).subscribe(() => {
      this.loginEnter.emit(login);
    }, () => {
      this.toastr.error('Ошибка при восстановлении пароля. Проверьте правильность логина.');
    });
  }
}
