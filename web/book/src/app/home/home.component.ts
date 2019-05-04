import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProfileService } from '../_services/profile.service';
import { Router } from '@angular/router';
import { finalize, first } from 'rxjs/operators';
import { OauthService } from './service/oauth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  providers: [
    OauthService,
  ]
})
export class HomeComponent implements OnInit {
  isIncorrect = false;
  isSync = false;
  formAuth: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private profileService: ProfileService,
    private oauthService: OauthService,
  ) {
    this.formAuth = this.fb.group({
      login: ['', [Validators.email]],
      password: ['', [Validators.minLength(3)]],
    });
  }

  ngOnInit() {
    this.oauth();
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

  private oauth() {
    this.oauthService.onLogin.pipe(first()).subscribe((onLogin: boolean) => {
      if (onLogin === true) {
        this.router.navigate(['/service']);
      }
    }, () => {
      this.isIncorrect = true;
      this.profileService.exit();
    });

    this.oauthService.auth();
  }
}
