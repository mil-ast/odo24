import { Component, OnInit, ViewChild, HostListener } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatSidenav } from '@angular/material/sidenav';
import { ProfileService } from './_services/profile.service';
import { Profile } from './_classes/profile';
import { ConfirmEmailDialogComponent } from './shared/confirm-email-dialog/confirm-email-dialog.component';
import { Avto } from './_classes/avto';
import { AvtoService } from './_services/avto.service';
import { GroupService, GroupStruct } from './_services/groups.service';
import { ScreenService, SmallScreen, Screen } from './_services/screen.service';
import { ProfileDialogComponent } from './shared/profile-dialog/profile-dialog.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  constructor(
    private avtoService: AvtoService,
    private groupService: GroupService,
    private dialog: MatDialog,
    private profileService: ProfileService,
    private screenService: ScreenService,
  ) { }

  @ViewChild('snav', {static: true}) sidenav: MatSidenav;
  @HostListener('window:resize', ['$event']) onResize() {
    this.screenService.onResize(window.innerWidth, window.innerHeight);
  }

  smallScreen = false;
  profile: Profile = null;

  ngOnInit() {
    this.avtoService.selected.subscribe((avto: Avto) => {
      if (avto) {
        this.sideNavClose();
      }
    });
    this.groupService.selected.subscribe((group: GroupStruct) => {
      if (group) {
        this.sideNavClose();
      }
    });

    this.profileService.profile$.subscribe((p: Profile) => {
      this.profile = p;
      if (p === null) {
        this.isSideNavOpened(false);
        return;
      }

      this.screenService.getScreen().subscribe(this.configureSideNav.bind(this));
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

  /*
      выход
  */
  clickLogout() {
    this.avtoService.setSelected(null);
    this.groupService.setSelected(null);
    this.profile = null;
    this.profileService.logout();
    return false;
  }

  configureSideNav(screen: Screen) {
    this.smallScreen = screen.innerWidth < SmallScreen ? true : false;
    if (!this.smallScreen) {
      this.isSideNavOpened(true);
    } else {
      this.isSideNavOpened(false);
    }
  }

  private isSideNavOpened(opened: boolean) {
    if (opened) {
      this.sidenav.mode = 'side';
    } else {
      this.sidenav.mode = 'push';
    }
    this.sidenav.opened = opened;
  }

  private sideNavClose() {
    if (this.smallScreen) {
      this.sidenav.close();
    }
  }
}
