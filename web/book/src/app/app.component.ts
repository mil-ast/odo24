import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material';
import { ProfileService } from './_services/profile.service';
import { Profile } from './_classes/profile';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  constructor(
    public snackBar: MatSnackBar,
    private profileService: ProfileService,
  ) { }

  profile_login: string = null;
  profile: Observable<Profile>;
  password = '';
  password2 = '';
  isProfile = false;

  ngOnInit() {
    this.profileService.profile$.subscribe((p: Profile) => {
      this.profile_login = (p !== null) ? p.login : null;
    }, () => {
      this.profile_login = null;
    });
  }

  submitUpdateFrofile() {
    if (this.password.length < 5 || this.password !== this.password2) {
      return;
    }

    const req = this.profileService.update({ password: this.password });
    req.subscribe(() => {
      this.password = '';
      this.password2 = '';

      this.showProfile(false);

      this.snackBar.open('Пароль успешно изменён!', 'OK', {
        duration: 5000,
      });
    }, (err) => {
      console.error(err);

      this.snackBar.open('Что-то пошло не так!', 'OK', {
        duration: 5000,
        panelClass: 'error',
      });
    });
  }

  /*
      скрыть/показать профиль
  */
  showProfile(event: boolean) {
    this.isProfile = event;
    return false;
  }

  /*
      выход
  */
  clickLogout() {
    this.profile_login = null;
    this.profileService.logout();
    return false;
  }
}
