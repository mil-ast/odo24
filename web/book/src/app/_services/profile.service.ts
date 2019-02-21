import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormControl } from '@angular/forms';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Profile } from '../_classes/profile';
import { map, catchError, tap } from 'rxjs/operators';
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
        if (!localIsAuth) {
            return of(false);
        }

        return this.http.get(this.url_profile).pipe(
            map((res: any) => {
                sessionStorage.setItem('isauth', '1');
                this.profile.next(new Profile(res));
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

    login(login: string, password: string): Observable<Profile> {
        return this.http.post<Profile>(this.url_login, { login: login, password: password }).pipe(tap((responce) => {
            const profile: Profile = new Profile(responce);
            sessionStorage.setItem('isauth', '1');
            this.profile.next(profile);
        }));
    }

    logout() {
        const req = this.http.get(this.url_logout);
        req.subscribe(() => { }, (err) => {
            console.error(err);
        });
        this.exit();
    }

    update(data: any) {
        return this.http.put(`${this.url_profile}/update_password`, data);
    }

    confirmEmail() {
        return this.http.post('/api/profile/confirm_email', {
            login: this.profile.getValue().login,
        });
    }

    checkCode(code: number) {
        return this.http.post('/api/profile/check_code', {
            login: this.profile.getValue().login,
            code: code,
        });
    }

    exit() {
        sessionStorage.removeItem('isauth');
        this.profile.next(null);
        this.router.navigate(['/']);
    }

    private loginOk(profile: Profile) {
        sessionStorage.setItem('isauth', '1');
        this.profile.next(profile);
    }
}
