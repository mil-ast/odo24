import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Profile } from '../_classes/profile';
import { map, catchError, tap } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable()
export class ProfileService {
  private baseURL = '/api/profile';

  private profile: BehaviorSubject<Profile> = new BehaviorSubject<Profile>(null);
  profile$: Observable<Profile>;

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {
    this.profile$ = this.profile.asObservable();
  }

  isAuthorized(): Observable<boolean> {
    const profile = this.profile.getValue();
    if (profile !== null) {
      return of(true);
    }

    return this.http.get(this.baseURL).pipe(
      map((res: any) => {
        this.profile.next(new Profile(res));
        return true;
      }, catchError(() => {
        this.profile.next(null);
        return of(false);
      }))
    );
  }

  login(login: string, password: string): Observable<Profile> {
    return this.http.post<Profile>(`${this.baseURL}/login`, { login: login, password: password }).pipe(tap((responce) => {
      const profile: Profile = new Profile(responce);
      this.profile.next(profile);
    }));
  }

  logout() {
    const req = this.http.get(`${this.baseURL}/logout`);
    req.subscribe(() => { }, (err) => {
      console.error(err);
    });
    this.exit();
  }

  update(data: any) {
    return this.http.put(`${this.baseURL}/update_password`, data);
  }

  passwordUpdate(password: string): Observable<void> {
    return this.http.post<void>(`${this.baseURL}/update_password`, { password: password });
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
    this.profile.next(null);
    this.router.navigate(['/login']);
  }
}
