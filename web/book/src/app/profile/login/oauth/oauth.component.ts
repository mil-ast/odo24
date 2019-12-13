import { Component, OnInit } from '@angular/core';
import { OauthService } from '../service/oauth.service';
import { ProfileService } from 'src/app/_services/profile.service';
import { mapTo, first } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-oauth',
  templateUrl: './oauth.component.html',
  styleUrls: ['./oauth.component.scss'],
  providers: [
    OauthService,
  ]
})
export class OauthComponent implements OnInit {
  isError = false;

  constructor(
    private oauthService: OauthService,
    private profileService: ProfileService,
    private router: Router,
  ) { }

  ngOnInit() {
    this.checkAuth().pipe(first()).subscribe(() => {
      this.router.navigate(['/service']);
    }, () => {
      this.isError = true;
    });
  }

  private checkAuth(): Observable<void> {
    const ouathQuery = this.oauthService.getParams();
    if (ouathQuery !== null) {
      return this.oauthService.auth(ouathQuery);
    } else {
      return this.profileService.isAuthorized().pipe(mapTo(null));
    }
  }
}
