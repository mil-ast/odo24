import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProfileService } from '../_services/profile.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { RegisterService } from './services/register.service';
import { finalize } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { Profile } from '../_classes/profile';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  formRegister: FormGroup;
  formConfirm: FormGroup;
  registered = false;

  constructor(
    private router: Router,
    private registerService: RegisterService,
    private profileService: ProfileService,
  ) {
    this.formRegister = new FormGroup({
      login: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('',  [Validators.required, Validators.minLength(5)]),
      password2: new FormControl(''),
      email: new FormControl('', Validators.email),
    }, (fg: FormGroup) => {
      if (fg.get('password').value !== fg.get('password2').value) {
        return {
          password2: true
        };
      }
      return null;
    });

    this.formConfirm = new FormGroup({
      code: new FormControl(null, [Validators.required, Validators.min(10000), Validators.max(99999)]),
    });
  }

  ngOnInit() {
  }

  submitRegister() {
    this.formRegister.disable();

    const login = this.formRegister.get('login').value;
    const password = this.formRegister.get('password').value;
    const email = this.formRegister.get('email').value || null;

    this.registerService.register(login, password, email).pipe(finalize(() => {
      this.formRegister.enable();
    })).subscribe((profile: Profile) => {
      this.registered = true;
    }, (err: HttpErrorResponse) => {

    });
  }
}
