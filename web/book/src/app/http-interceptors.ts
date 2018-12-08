
import {tap} from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProfileService } from './_services/profile.service';

import {
    HttpEvent,
    HttpInterceptor,
    HttpHandler,
    HttpRequest
} from '@angular/common/http';
    
@Injectable()
export class HTTPRequestsInterceptor implements HttpInterceptor {
    constructor(
        private profileService: ProfileService,
    ) {}

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(req).pipe(tap(() => {}, err => {
            switch(err.status) {
            case 401: case 403:
                this.profileService.Exit();
            }
        }));
    }
}

export const httpInterceptorProviders = [
    { provide: HTTP_INTERCEPTORS, useClass: HTTPRequestsInterceptor, multi: true },
];