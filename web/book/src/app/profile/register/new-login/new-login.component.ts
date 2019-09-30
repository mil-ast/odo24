import { Component, OnInit, Output, EventEmitter, NgZone } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { finalize, first } from 'rxjs/operators';
import { RegisterService } from '../services/register.service';
import { ToastrService } from 'ngx-toastr';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-new-login',
  templateUrl: './new-login.component.html',
  styleUrls: ['./new-login.component.scss']
})
export class NewLoginComponent implements OnInit {
  @Output() loginEnter: EventEmitter<string> = new EventEmitter();
  form: FormGroup;

  constructor(
    private ngZone: NgZone,
    private registerService: RegisterService,
    private toastr: ToastrService,
  ) {
    this.form = new FormGroup({
      login: new FormControl('', [Validators.required, Validators.email]),
    });
  }

  ngOnInit() {}

  submitRegister() {
    if (this.form.invalid) {
      return false;
    }

    this.form.disable();

    const login = this.form.get('login').value;

    this.registerService.register(login).pipe(finalize(() => {
      this.form.enable();
    })).subscribe(() => {
      this.loginEnter.emit(login);
    }, (err: HttpErrorResponse) => {
      this.ngZone.onStable.pipe(
        first()
      ).subscribe(() => {
        const control = this.form.get('login');
        control.setErrors({
          login_busy: true
        });
      });

      if (err.status === 409) {
        this.toastr.error(`Логин ${login} уже зарегистрирован.`);
      } else {
        this.toastr.error('Ошибка при регистрации логина');
      }
    });
  }
}
