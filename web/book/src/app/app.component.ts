import { Component, OnInit, ViewChild, HostListener } from '@angular/core';
import { MatDialog, MatSidenav, MatDialogConfig } from '@angular/material';
import { ProfileService } from './_services/profile.service';
import { Profile } from './_classes/profile';
import { ConfirmEmailDialogComponent } from './shared/confirm-email-dialog/confirm-email-dialog.component';
import { PrifileDialogComponent } from './shared/prifile-dialog/prifile-dialog.component';
import { AvtoStruct, Avto } from './_classes/avto';
import { AvtoService } from './_services/avto.service';
import { GroupService, GroupStruct } from './_services/groups.service';
import { DialogUpdateGroupComponent } from './shared/dialog-update-group/dialog-update-group.component';
import { DialogCreateGroupComponent } from './shared/dialog-create-group/dialog-create-group.component';
import { DialogCreateAvtoComponent } from './shared/dialog-create-avto/dialog-create-avto.component';
import { ScreenService, SmallScreen, Screen } from './_services/screen.service';
import { DialogUpdateAvtoComponent } from './shared/dialog-update-avto/dialog-update-avto.component';
import { ConfirmationDialogComponent } from './shared/confirmation-dialog/confirmation-dialog.component';

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

  @ViewChild('snav') sidenav: MatSidenav;
  @HostListener('window:resize', ['$event']) onResize() {
    this.screenService.onResize(window.innerWidth, window.innerHeight);
  }

  smallScreen = false;
  avtoList: Avto[] = [];
  groupList: GroupStruct[] = [];
  selectedAvto: Avto = null;
  selectedGroup: GroupStruct = null;
  isSync = false;
  profile: Profile = null;

  ngOnInit() {
    this.avtoService.selected.subscribe((avto: Avto) => {
      this.selectedAvto = avto;
      if (avto) {
        this.fetchGroups();
      }
    });
    this.groupService.selected.subscribe((group: GroupStruct) => {
      this.selectedGroup = group;
    });

    this.profileService.profile$.subscribe((p: Profile) => {
      this.profile = p;
      if (p === null) {
        this.isSideNavOpened(false);
        return;
      }

      this.fetchAvto();
      this.screenService.getScreen().subscribe(this.configureSideNav.bind(this));
    }, () => {
      this.profile = null;
    });
  }

  clickShowChangePasswordDialog() {
    this.dialog.open(PrifileDialogComponent, {
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

  clickSelectGroup(group: GroupStruct) {
    this.groupService.setSelected(group);
  }

  clickSelectAvto(avto: AvtoStruct) {
    this.avtoService.setSelected(avto);
  }

  clickShowAddGroup() {
    this.dialog.open(DialogCreateGroupComponent, {
      width: '500px',
      autoFocus: false,
    }).afterClosed().subscribe((group: GroupStruct) => {
      if (group) {
        this.groupList.push(group);
        this.groupService.setSelected(group);
      }
    });
  }

  clickShowAddAvto(disableClose: boolean = false) {
    const dialog = this.dialog.open(DialogCreateAvtoComponent, {
      autoFocus: false,
      disableClose: disableClose,
    });
    dialog.afterClosed().subscribe((data: AvtoStruct) => {
      if (data) {
        const avto = new Avto(data);
        this.avtoList.push(avto);
        this.avtoService.setSelected(avto);
      }
    });
  }

  clickShowEditAvto(avto: AvtoStruct) {
    let position = null;
    if (!this.smallScreen) {
      position = '40px';
    }
    const dialog = this.dialog.open(DialogUpdateAvtoComponent, {
      autoFocus: false,
      data: avto,
      width: '500px',
      position: {
        left: position,
      }
    });
    dialog.afterClosed().subscribe();
  }

  clickDeleteAvto(avto: Avto) {
    const dialog = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: 'Удалить авто?',
        message: 'Удалить авто и всю историю по ней? Восстановление будет невозможным!',
        type: 'warn'
      },
    });
    dialog.afterClosed().subscribe((ok: boolean) => {
      if (!ok) {
        return;
      }

      this.avtoService.delete(avto.avto_id).subscribe(() => {
        this.onAvtoDelete(avto);
      });
    });
  }

  clickEditGroup(group: GroupStruct) {
    this.dialog.open(DialogUpdateGroupComponent, {
      autoFocus: false,
      data: group
    });
  }

  // евент удаления авто
  onAvtoDelete(avto: Avto) {
    const index = this.avtoList.indexOf(avto);
    if (index !== -1) {
      this.avtoList.splice(index, 1);
      if (this.avtoList.length > 0) {
        this.avtoService.setSelected(this.avtoList[0]);
      } else {
        this.avtoService.setSelected(null);
      }
    }
  }

  // евент удаления группы
  onGroupDelete(group: GroupStruct) {
    let index = this.groupList.indexOf(group);
    if (index !== -1) {
      this.groupList.splice(index, 1);
      if (index > 0) {
        index--;
      }
      this.groupService.setSelected(this.groupList[index]);
    }
  }

  /*
      выход
  */
  clickLogout() {
    this.avtoList = [];
    this.groupList = [];

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

  private fetchAvto() {
    this.avtoService.get().subscribe((list: Avto[]) => {
      this.avtoList = list || [];
      if (this.avtoList.length > 0) {
        this.avtoService.setSelected(list[0]);
      } else {
        this.clickShowAddAvto(true);
      }

      this.isSync = false;
    });
  }

  private fetchGroups() {
    this.groupList = [];
    this.groupService.get(this.selectedAvto.avto_id).subscribe((list: GroupStruct[]) => {
      this.groupList = list || [];
      if (this.groupList.length > 0) {
        if (this.selectedGroup) {
          const group = this.groupList.find((g: GroupStruct) => {
            return g.group_id === this.selectedGroup.group_id;
          });
          if (group) {
            this.groupService.setSelected(group);
            return;
          }
        }

        this.groupService.setSelected(this.groupList[0]);
      } else {
        this.groupService.setSelected(null);
      }
    });
  }
}
