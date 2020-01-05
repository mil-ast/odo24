import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Profile } from '../_classes/profile';
import { map, catchError, finalize } from 'rxjs/operators';
import { Router } from '@angular/router';

interface ProfileModel {
  user_id: number;
  confirmed: boolean;
  login: string;
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

    return this.http.get(this.baseURL).pipe(
      map((res: ProfileModel) => {
        this.profile.next(new Profile(res));
        return true;
      }, catchError(() => {
        this.profile.next(null);
        return of(false);
      }))
    );
  }

  login(login: string, password: string): Observable<Profile> {
    return this.http.post<Profile>(`${this.baseURL}/login`, { login: login, password: password }).pipe(
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

  passwordUpdate(password: string): Observable<void> {
    return this.http.post<void>(`${this.baseURL}/update_password`, { password: password });
  }

  exit() {
    this.profile.next(null);
    this.router.navigate(['/login']);
  }
}
