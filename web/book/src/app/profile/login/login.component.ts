import { Component, OnDestroy } from '@angular/core';
import { ProfileService } from '../../_services/profile.service';
import { Router } from '@angular/router';
import { first, takeUntil } from 'rxjs/operators';
import { OauthService } from './service/oauth.service';
import { ReplaySubject, Observable } from 'rxjs';
import { FormGroup, FormControl, Validators } from '@angular/forms';

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

  constructor(
    private router: Router,
    private profileService: ProfileService,
    private oauthService: OauthService,
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
      this.router.navigate(['/login']);
    });
  }

  ngOnDestroy() {
    this.destroy.next(null);
    this.destroy.complete();
  }

  submitLogin() {

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
