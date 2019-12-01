import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProfileService } from '../_services/profile.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  constructor(
    private profileService: ProfileService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.profileService.isAuthorized().subscribe((ok: boolean) => {
      if (ok) {
        this.router.navigate(['/service']);
      }
    });
  }
}
