import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { ProfileService } from './_services/profile.service';
import { Profile } from './_classes/profile';
import { ConfirmEmailDialogComponent } from './shared/confirm-email-dialog/confirm-email-dialog.component';
import { PrifileDialogComponent } from './shared/prifile-dialog/prifile-dialog.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  constructor(
    private dialog: MatDialog,
    private profileService: ProfileService,
  ) { }

  profile: Profile = null;

  ngOnInit() {
    this.profileService.profile$.subscribe((p: Profile) => {
      if (p === null) {
        return;
      }

      this.profile = p;
    }, () => {
      this.profile = null;
    });
  }

  clickShowChangePasswordDialog() {
    this.dialog.open(PrifileDialogComponent, {
      position: {
        top: '80px',
        right: '40px'
      }
    });
  }

  clickShowConfirmEmailDialog() {
    this.dialog.open(ConfirmEmailDialogComponent, {
      position: {
        top: '80px',
        right: '40px'
      },
      data: this.profile
    });
  }

  /*
      выход
  */
  clickLogout() {
    this.profile = null;
    this.profileService.logout();
    return false;
  }

  private confirmEmailDialog(p: Profile) {
    this.dialog.open(ConfirmEmailDialogComponent, {
      data: p
    });
  }
}
