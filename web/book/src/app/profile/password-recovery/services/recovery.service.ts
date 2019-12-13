import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

const baseURL = '/api/profile';

@Injectable()
export class RecoveryService {
  constructor(
    private http: HttpClient
  ) { }

  recoverLogin(login: string): Observable<void> {
    return this.http.post<void>(`${baseURL}/password_recovery`, {
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
