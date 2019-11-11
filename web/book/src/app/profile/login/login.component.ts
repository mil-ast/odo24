import { Component, OnDestroy } from '@angular/core';
import { ProfileService } from '../../_services/profile.service';
import { Router } from '@angular/router';
import { first, takeUntil } from 'rxjs/operators';
import { OauthService } from './service/oauth.service';
import { ReplaySubject, Observable } from 'rxjs';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  providers: [
    OauthService,
  ]
})
export class LoginComponent implements OnDestroy {
  private destroy: ReplaySubject<boolean> = new ReplaySubject(1);

  form: FormGroup;
  loginError = false;

  constructor(
    private router: Router,
    private profileService: ProfileService,
    private oauthService: OauthService,
    private toastr: ToastrService,
  ) {
    this.form = new FormGroup({
      login: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', Validators.required),
    });

    this.getAuthObservable().pipe(
      first(),
      takeUntil(this.destroy)
    ).subscribe(() => {
      this.router.navigate(['/service']);
    }, () => {
      this.router.navigate(['/profile/login']);
    });
  }

  ngOnDestroy() {
    this.destroy.next(null);
    this.destroy.complete();
  }

  submitLogin() {
    this.loginError = false;
    const login = this.form.get('login').value;
    const password = this.form.get('password').value;
    this.profileService.login(login, password).subscribe(() => {
      this.router.navigate(['/service']);
    }, () => {
      this.loginError = true;
    });
  }

  private getAuthObservable(): Observable<any> {
    const ouathQuery = this.oauthService.getParams();
    if (ouathQuery !== null) {
      return this.oauthService.auth(ouathQuery);
    } else {
      return this.profileService.isAuthorized();
    }
  }
}
