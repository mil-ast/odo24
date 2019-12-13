import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ProfileService } from './_services/profile.service';
import { Profile } from './_classes/profile';
import { ProfileDialogComponent } from './shared/profile-dialog/profile-dialog.component';
import { AsideService } from './_services/aside.service';
import { AutoService } from './_services/avto.service';
import { GroupService } from './_services/groups.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  constructor(
    public asideService: AsideService,
    private dialog: MatDialog,
    private profileService: ProfileService,
    private autoService: AutoService,
    private groupService: GroupService,
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
  
  // выход
  clickLogout() {
    this.profile = null;
    this.profileService.logout();

    this.autoService.setSelected(null);
    this.groupService.setSelected(null);
    return false;
  }
}
