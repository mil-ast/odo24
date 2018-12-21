import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormControl } from '@angular/forms';
import { BehaviorSubject, Observable, of } from 'rxjs';

import { Profile } from '../_classes/profile';
import { map, catchError } from 'rxjs/operators';

@Injectable()
export class ProfileService {
    private url_login = '/api/profile/login';
    private url_logout = '/api/profile/logout';
    private url_profile = '/api/profile';

    private profile: BehaviorSubject<Profile> = new BehaviorSubject<Profile>(null);
    profile$: Observable<Profile>;

    constructor(
        private router: Router,
        private http: HttpClient
    ) {
        this.profile$ = this.profile.asObservable();
    }

    isAuthorized(): Observable<boolean> {
        const localIsAuth = sessionStorage.getItem('isauth');
        if (!localIsAuth) {
            return of(false);
        }

        return this.http.get(this.url_profile).pipe(
            map((res: any) => {
                const profile = new Profile(res);
                this.profile.next(profile);
                sessionStorage.setItem('isauth', '1');

                return true;
            }, catchError(() => {
                sessionStorage.removeItem('isauth');
                this.profile.next(null);
                return of(false);
            }))
        );
    }

    GetProfile() {
        return this.profile;
    }

    sync() {
        this.http.get(this.url_profile).subscribe((res: any) => {
            this.loginOk(new Profile(res));
        });
    }

    Login(login: string, password: string) {
        const req = this.http.post(this.url_login, { login: login, password: password });
        req.subscribe((responce: any) => {
            const profile: Profile = new Profile(responce);

            localStorage.setItem('auth', profile.login);
            this.profile.next(profile);

            this.router.navigate(['/service']);
        }, () => {
            this.Exit();
        });
    }

    Logout() {
        const req = this.http.get(this.url_logout);
        req.subscribe(() => { }, (err) => {
            console.error(err);
        }, () => {
            this.Exit();
        });
    }

    Update(data: any) {
        return this.http.patch(this.url_profile, data);
    }

    passwordConfirm(c: FormControl) {
        if (!c || !c.parent) {
            return;
        }

        const pwd = c.parent.get('password');
        const cpwd = c.parent.get('password2');

        if (!pwd || !cpwd) {
            return { invalid: true };
        }
        if (pwd.value !== cpwd.value) {
            return { invalid: true };
        }

        return;
    }

    CheckAuth(): boolean {
        if (localStorage.getItem('auth') !== null) {
            return true;
        } else {
            return this.profile.getValue() !== null;
        }
    }

    Exit() {
        localStorage.removeItem('auth');
        this.profile.next(null);
        this.router.navigate(['/']);
    }

    private loginOk(profile: Profile) {
        localStorage.setItem('auth', profile.login);
        this.profile.next(profile);

        this.router.navigate(['/service']);
    }
}
