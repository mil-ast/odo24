import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ReplaySubject } from 'rxjs';
import { Router } from '@angular/router';
import { ProfileService } from 'src/app/_services/profile.service';
import { OauthService } from '../service/oauth.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  isIncorrect = false;
  isSync = false;
  formAuth: FormGroup;
  private destroy: ReplaySubject<boolean> = new ReplaySubject(1);

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private profileService: ProfileService,
  ) {
    this.formAuth = this.fb.group({
      login: ['', Validators.email],
      password: ['', Validators.minLength(3)],
    });
  }

  ngOnInit() {
  }

  submitLogin() {
    if (this.formAuth.invalid) {
      return;
    }

    this.isSync = true;
    this.isIncorrect = false;
    this.formAuth.disable();
    this.profileService.login(this.formAuth.controls.login.value, this.formAuth.controls.password.value).pipe(
      finalize(() => {
        this.formAuth.enable();
      })
    ).subscribe(() => {
      this.router.navigate(['/service']);
    }, () => {
      this.isIncorrect = true;
      this.profileService.exit();
    });
  }
}
