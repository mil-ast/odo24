import { Component, OnDestroy } from '@angular/core';
import { ProfileService } from '../../_services/profile.service';
import { Router } from '@angular/router';
import { ReplaySubject } from 'rxjs';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnDestroy {
  private destroy: ReplaySubject<boolean> = new ReplaySubject(1);

  form: FormGroup;
  loginError = false;

  constructor(
    private router: Router,
    private profileService: ProfileService,
  ) {
    this.form = new FormGroup({
      login: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', Validators.required),
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
}
