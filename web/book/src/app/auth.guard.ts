import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { ProfileService } from './_services/profile.service';
import { map } from 'rxjs/operators';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private router: Router,
        private profileService: ProfileService,
    ) { }

    canActivate() {
        return this.profileService.isAuthorized().pipe(
            map(isAuth => {
                console.log('canActivate', isAuth);
                if (isAuth) {
                    return true;
                }

                

                this.router.navigate(['/']);
                return false;
            }),
        );
    }
}
