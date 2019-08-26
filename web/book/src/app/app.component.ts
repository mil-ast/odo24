import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ProfileService } from './_services/profile.service';
import { Profile } from './_classes/profile';
import { ConfirmEmailDialogComponent } from './shared/confirm-email-dialog/confirm-email-dialog.component';
import { ProfileDialogComponent } from './shared/profile-dialog/profile-dialog.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  constructor(
    private dialog: MatDialog,
    private profileService: ProfileService,
  ) { }

  smallScreen = false;
  profile: Profile = null;

  ngOnInit() {
    this.profileService.profile$.subscribe((p: Profile) => {
      this.profile = p;
    }, () => {
      this.profile = null;
    });
  }

  clickShowChangePasswordDialog() {
    this.dialog.open(ProfileDialogComponent, {
      position: {
        top: '80px',
        right: '40px'
      },
      autoFocus: false,
    });
  }

  clickShowConfirmEmailDialog() {
    const config: MatDialogConfig = {
      autoFocus: false,
      data: this.profile,
    };
    if (this.smallScreen) {
      config.minWidth = '98%';
      config.position = {
        top: '4px'
      };
    } else {
      config.position = {
        top: '80px',
        right: '40px'
      };
    }
    this.dialog.open(ConfirmEmailDialogComponent, config);
  }

  // выход
  clickLogout() {
    this.profile = null;
    this.profileService.logout();
    return false;
  }
}
