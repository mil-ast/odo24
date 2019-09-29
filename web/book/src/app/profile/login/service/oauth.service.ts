import { Injectable } from '@angular/core';
import { Subject, Observable, throwError, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';

export interface OauthQuery {
  service: string;
  code: string;
}

@Injectable()
export class OauthService {
  onLogin: Subject<boolean> = new Subject();
  private baseURL = '/api/profile';

  constructor(
    private http: HttpClient,
  ) { }

  getParams(): OauthQuery {
    const urlParams = new URLSearchParams(window.location.search);
    const service = urlParams.get('service');
    const code = urlParams.get('code');

    if (!service || !code) {
      return null;
    }

    return {
      service: service,
      code: code,
    };
  }

  auth(patam: OauthQuery): Observable<void> {
    switch (patam.service) {
      case 'yandex.ru': case 'mail.ru': case 'google':
        return this.authByCode(patam.service, patam.code);
      default:
        return throwError('Сервис не поддерживается');
    }
  }

  private authByCode(service: string, code: string): Observable<void> {
    return this.http.get<void>(`${this.baseURL}/oauth`, {
      params: {
        service: service,
        code: code,
      }
    });
  }
}
