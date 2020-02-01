import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Profile } from '../_classes/profile';
import { map, catchError, finalize, mergeMap, tap } from 'rxjs/operators';
import { Router } from '@angular/router';

interface ProfileModel {
  user_id: number;
  confirmed: boolean;
  login: string;
}

interface Token {
  jwt: string;
  jwt_exp: string;
  rt: string;
  rt_exp: string;
}

@Injectable()
export class ProfileService {
  profile$: Observable<Profile>;
  private baseURL = '/api/profile';
  private profile: BehaviorSubject<Profile> = new BehaviorSubject<Profile>(null);

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

    return this.getProfile().pipe(
      map((p: Profile) => {
        this.profile.next(p || null);
        return true;
      }),
      catchError(() => {
        this.profile.next(null);
        return of(false);
      })
    );
  }

  getProfile(): Observable<Profile> {
    return this.http.get<ProfileModel>(this.baseURL).pipe(
      map((res: ProfileModel) => new Profile(res))
    );
  }

  login(login: string, password: string): Observable<Profile> {
    const body = {
      login: login,
      password: password
    };
    return this.http.post<Token>(`${this.baseURL}/login`, body).pipe(
      mergeMap((token: Token) => {
        this.setTokenInfo(token);
        return this.getProfile();
      }),
      map((response) => {
        const profile: Profile = new Profile(response);
        this.profile.next(profile);
        return profile;
      })
    );
  }

  logout() {
    this.http.get<void>(`${this.baseURL}/logout`).pipe(
      finalize(() => {
        this.exit();
      })
    ).subscribe();
  }

  refreshToken(rt: string): Observable<Token> {
    const profile = this.profile.getValue();
    const body = {
      user_id: profile.user_id,
      rt: rt,
    };

    return this.http.put<Token>(`${this.baseURL}/refresh_token`, body).pipe(
      tap((token: Token) => {
        this.setTokenInfo(token);
      })
    );
  }

  passwordUpdate(password: string): Observable<void> {
    return this.http.post<void>(`${this.baseURL}/update_password`, { password: password });
  }

  exit() {
    this.profile.next(null);
    this.clearTokenInfo();
    this.router.navigate(['/login']);
  }

  private setTokenInfo(token: Token) {
    window.localStorage.setItem('rt', token.rt);
    window.localStorage.setItem('rt_exp', token.rt_exp);
    window.localStorage.setItem('jwt_exp', token.jwt_exp);
  }

  private clearTokenInfo() {
    window.localStorage.removeItem('rt');
    window.localStorage.removeItem('rt_exp');
    window.localStorage.removeItem('jwt_exp');
  }
}
