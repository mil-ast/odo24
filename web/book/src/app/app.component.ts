import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material';
import { ProfileService } from './_services/profile.service';
import { Profile } from './_classes/profile';

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
    password: string = '';
    password2: string = '';
    is_profile: boolean = false;

    ngOnInit() {
        // проверяем регистрацию
        this.profileService.sync();

        // подписка на профиль
        this.profileService.GetProfile().subscribe((profile: Profile) => {
            if (profile !== null) {
                this.profile_login = profile.login || null;
            } else {
                this.profile_login = null;
            }
        });
    }

    SubmitUpdateFrofile() {
        if (this.password.length < 5 || this.password != this.password2) {
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
        this.is_profile = event;
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
