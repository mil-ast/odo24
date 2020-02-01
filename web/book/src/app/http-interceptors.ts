import { catchError, mergeMap, map, mapTo, mergeMapTo, switchMap, switchMapTo, filter, tap } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { HTTP_INTERCEPTORS, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Observable, of, EMPTY, throwError, iif } from 'rxjs';
import { ProfileService } from './_services/profile.service';
import { Router } from '@angular/router';
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest
} from '@angular/common/http';
import * as moment from 'moment';


@Injectable()
export class HTTPRequestsInterceptor implements HttpInterceptor {
  constructor(
    private router: Router,
    private profileService: ProfileService,
  ) {
    this.handleError = this.handleError.bind(this);
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (req.url.endsWith('/profile/login') || req.url.endsWith('/profile/oauth') || req.url.endsWith('/profile/refresh_token')) {
      return next.handle(req);
    }

    const jwtExpStr = window.localStorage.getItem('jwt_exp');
    if (!jwtExpStr) {
      return this.unauthozire();
    }

    const now = moment();
    const expTime = moment(jwtExpStr);

    if (expTime.isBefore(now)) {
      const rt = window.localStorage.getItem('rt');
      return this.profileService.refreshToken(rt).pipe(
        switchMapTo(next.handle(req)),
        catchError(this.handleError)
      );
    }

    return next.handle(req).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(err: HttpErrorResponse): Observable<never> {
    switch (err.status) {
      case 401: case 403:
        return this.unauthozire();
    }
    return throwError(err);
  }

  private unauthozire(): Observable<never> {
    this.profileService.exit();
    this.router.navigate(['/profile/login']);
    return throwError('Unauthorized');
  }
}

export const httpInterceptorProviders = [
  { provide: HTTP_INTERCEPTORS, useClass: HTTPRequestsInterceptor, multi: true },
];
