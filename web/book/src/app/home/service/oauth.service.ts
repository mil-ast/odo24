import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class OauthService {
  onLogin: Subject<boolean> = new Subject();
  private baseURL = '/api/profile';

  constructor(
    private http: HttpClient,
  ) { }

  auth() {
    const urlParams = new URLSearchParams(window.location.search);
    const service = urlParams.get('service');

    switch (service) {
      case 'yandex.ru': case 'mail.ru':
        this.authByCode(service, urlParams.get('code'));
      break;
      default:
        this.onLogin.next(null);
    }
  }

  private authByCode(service: string, code: string) {
    this.http.get<void>(`${this.baseURL}/oauth`, {
      params: {
        service: service,
        code: code,
      }
    }).subscribe(() => {
      this.onLogin.next(true);
    }, () => {
      this.onLogin.next(false);
    });
  }
}
