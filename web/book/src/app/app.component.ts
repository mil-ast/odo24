import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material';
import { ProfileService } from './_services/profile.service';
import { Profile } from './_classes/profile';
import { first } from 'rxjs/operators';

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
    password = '';
    password2 = '';
    isProfile = false;

    ngOnInit() {
        this.profileService.profile$.pipe(
            first()
        ).subscribe((p: Profile) => {
            console.log(p);
            if (p !== null) {
                this.profile_login = p.login;
            } else {
                this.profile_login = null;
            }
        });
    }

    SubmitUpdateFrofile() {
        if (this.password.length < 5 || this.password !== this.password2) {
            return false;
        }

        const req = this.profileService.Update({ password: this.password });
        req.subscribe(() => {
            this.password = '';
            this.password2 = '';

            this.ShowProfile(false);

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
        return false;
    }

    /*
        скрыть/показать профиль
    */
    ShowProfile(event) {
        this.isProfile = event;
        return false;
    }

    /*
        выход
    */
    ClickLogout() {
        this.profileService.Logout();
        return false;
    }
}
