import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { ProfileService } from './_services/profile.service';
import { Profile } from './_classes/profile';
import { ConfirmEmailDialogComponent } from './shared/confirm-email-dialog/confirm-email-dialog.component';
import { PrifileDialogComponent } from './shared/prifile-dialog/prifile-dialog.component';
import { AvtoStruct } from './_classes/avto';
import { AvtoService } from './_services/avto.service';
import { GroupService, GroupStruct } from './_services/groups.service';
import { DialogUpdateGroupComponent } from './app_components/dialog-update-group/dialog-update-group.component';
import { DialogCreateGroupComponent } from './app_components/dialog-create-group/dialog-create-group.component';
import { DialogCreateAvtoComponent } from './services/dialogs/dialog-create-avto/dialog-create-avto.component';

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
  ) { }

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

  // евент удаления группы
  onGroupDelete(group: GroupStruct) {
    const index = this.groupList.indexOf(group);
    if (index !== -1) {
      this.groupList.splice(index, 1);
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
        this.groupService.setSelected(this.groupList[0]);
      }
    });
  }

  private confirmEmailDialog(p: Profile) {
    this.dialog.open(ConfirmEmailDialogComponent, {
      data: p
    });
  }
}
