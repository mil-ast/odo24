import { Component, OnInit, OnDestroy } from '@angular/core';
import { ProfileService } from '../_services/profile.service';
import { Router } from '@angular/router';
import { first, takeUntil } from 'rxjs/operators';
import { OauthService } from './service/oauth.service';
import { ReplaySubject, Observable } from 'rxjs';

@Component({
  selector: 'app-home',
  template: '...',
  providers: [
    OauthService,
  ]
})
export class HomeComponent implements OnDestroy {
  private destroy: ReplaySubject<boolean> = new ReplaySubject(1);

  constructor(
    private router: Router,
    private profileService: ProfileService,
    private oauthService: OauthService,
  ) {
    this.getAuthObservable().pipe(
      first(),
      takeUntil(this.destroy)
    ).subscribe(() => {
      this.router.navigate(['/service']);
    }, () => {
      this.router.navigate(['/login']);
    });
  }

  ngOnDestroy() {
    this.destroy.next(null);
    this.destroy.complete();
  }

  private getAuthObservable(): Observable<any> {
    const ouathQuery = this.oauthService.getParams();
    if (ouathQuery !== null) {
      return this.oauthService.auth(ouathQuery);
    } else {
      return this.profileService.isAuthorized();
    }
  }
}
