import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormControl } from '@angular/forms';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Profile } from '../_classes/profile';
import { map, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable()
export class ProfileService {
    private url_login = '/api/profile/login';
    private url_logout = '/api/profile/logout';
    private url_profile = '/api/profile';

    private profile: BehaviorSubject<Profile> = new BehaviorSubject<Profile>(null);
    profile$: Observable<Profile>;

    constructor(
        private http: HttpClient,
        private router: Router,
    ) {
        this.profile$ = this.profile.asObservable();
    }

    isAuthorized(): Observable<boolean> {
        const localIsAuth = sessionStorage.getItem('isauth');
        console.log(localIsAuth);
        if (!localIsAuth) {
            return of(false);
        }

        return this.http.get(this.url_profile).pipe(
            map((res: any) => {
                const profile = new Profile(res);

                sessionStorage.setItem('isauth', '1');
                return true;
            }, catchError(() => {
                sessionStorage.removeItem('isauth');
                this.profile.next(null);
                return of(false);
            }))
        );
    }

    sync() {
        this.http.get(this.url_profile).subscribe((res: any) => {
            this.loginOk(new Profile(res));
        });
    }

    login(login: string, password: string) {
        const req = this.http.post(this.url_login, { login: login, password: password });
        req.subscribe((responce: any) => {
            const profile: Profile = new Profile(responce);

            sessionStorage.setItem('isauth', '1');
            this.profile.next(profile);
            this.router.navigate(['/service']);
        }, () => {
            this.exit();
        });
    }

    Logout() {
        const req = this.http.get(this.url_logout);
        req.subscribe(() => { }, (err) => {
            console.error(err);
        }, () => {
            this.exit();
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

    exit() {
        sessionStorage.removeItem('isauth');
        this.profile.next(null);
    }

    private loginOk(profile: Profile) {
        sessionStorage.setItem('isauth', '1');
        this.profile.next(profile);
    }
}
