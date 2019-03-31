import { Component, OnInit, ViewChild, HostListener } from '@angular/core';
import { MatDialog, MatSidenav } from '@angular/material';
import { ProfileService } from './_services/profile.service';
import { Profile } from './_classes/profile';
import { ConfirmEmailDialogComponent } from './shared/confirm-email-dialog/confirm-email-dialog.component';
import { PrifileDialogComponent } from './shared/prifile-dialog/prifile-dialog.component';
import { AvtoStruct } from './_classes/avto';
import { AvtoService } from './_services/avto.service';
import { GroupService, GroupStruct } from './_services/groups.service';
import { DialogUpdateGroupComponent } from './app_components/dialog-update-group/dialog-update-group.component';
import { DialogCreateGroupComponent } from './app_components/dialog-create-group/dialog-create-group.component';
import { DialogCreateAvtoComponent } from './app_components/dialog-create-avto/dialog-create-avto.component';
import { ScreenpService, SmallScreen, Screen } from './_services/screen.service';

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
    private screenService: ScreenpService,
  ) { }

  @ViewChild('snav') sidenav: MatSidenav;
  @HostListener('window:resize', ['$event']) onResize() {
    this.screenService.onResize(window.innerWidth, window.innerHeight);
  }

  smallScreen = false;
  avtoList: AvtoStruct[] = [];
  groupList: GroupStruct[] = [];
  selectedAvto: AvtoStruct = null;
  selectedGroup: GroupStruct = null;

  isSync = false;
  profile: Profile = null;

  ngOnInit() {
    this.avtoService.selected.subscribe((avto: AvtoStruct) => {
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

  clickSelectGroup(group: GroupStruct) {
    this.groupService.setSelected(group);
  }

  clickSelectAvto(avto: AvtoStruct) {
    this.avtoService.setSelected(avto);
  }

  clickShowAddGroup() {
    this.dialog.open(DialogCreateGroupComponent, {
      width: '500px',
    }).afterClosed().subscribe((group: GroupStruct) => {
      if (group) {
        this.groupList.push(group);
        this.groupService.setSelected(group);
      }
    });
  }

  clickShowAddAvto() {
    const dialog = this.dialog.open(DialogCreateAvtoComponent, {
      width: '500px',
    });

    dialog.afterClosed().subscribe((avto: AvtoStruct) => {
      if (avto) {
        this.avtoList.push(avto);
        this.avtoService.setSelected(avto);
      }
    });
  }

  clickEditGroup(group: GroupStruct) {
    this.dialog.open(DialogUpdateGroupComponent, {
      width: '500px',
      data: group
    });
  }

  // евент удаления авто
  onAvtoDelete(avto: AvtoStruct) {
    const index = this.avtoList.indexOf(avto);
    if (index !== -1) {
      this.avtoList.splice(index, 1);
      if (this.avtoList.length > 0) {
        this.avtoService.setSelected(this.avtoList[0]);
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
    this.profile = null;
    this.profileService.logout();
    return false;
  }

  configureSideNav(screen: Screen) {
    this.smallScreen = screen.innerWidth < SmallScreen ? true : false;
    console.log(this.smallScreen);
    if (!this.smallScreen) {
      this.sidenav.mode = 'side';
      this.sidenav.opened = true;
    } else {
      this.sidenav.mode = 'push';
      this.sidenav.opened = false;
    }
  }

  private fetchAvto() {
    this.avtoService.get().subscribe((list: AvtoStruct[]) => {
      this.avtoList = list || [];
      if (this.avtoList.length > 0) {
        this.avtoService.setSelected(list[0]);
      }

      this.isSync = false;
    });
  }

  private fetchGroups() {
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

  private confirmEmailDialog(p: Profile) {
    this.dialog.open(ConfirmEmailDialogComponent, {
      data: p
    });
  }
}
