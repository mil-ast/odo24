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

  confirmCode(login: string, code?: number, linkKey?: string): Observable<void> {
    return this.http.post<void>(`${baseURL}/confirm_code`, {
      login: login,
      code: code,
      link_key: linkKey,
    });
  }
}
