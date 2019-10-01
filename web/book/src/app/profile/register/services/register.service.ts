import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Profile } from 'src/app/_classes/profile';
import { map } from 'rxjs/operators';

interface RegisterResponce {
  user_id: number;
  login: string;
  email?: boolean;
  confirmed?: boolean;
}

const baseURL = '/api/profile';

@Injectable()
export class RegisterService {
  constructor(
    private http: HttpClient
  ) { }

  register(login: string): Observable<void> {
    return this.http.post<void>(`${baseURL}/register`, {
      login: login,
    });
  }

  resetPassword(login: string, password: string, code?: number, linkKey: string = null): Observable<void> {
    return this.http.post<void>(`${baseURL}/reset_password`, {
      login: login,
      password: password,
      code: code,
      link_key: linkKey,
    });
  }
}
