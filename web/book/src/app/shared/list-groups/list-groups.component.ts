import { Component, OnInit, OnDestroy } from '@angular/core';
import { GroupStruct, GroupService } from 'src/app/_services/groups.service';
import { AvtoService } from 'src/app/_services/avto.service';
import { Avto } from 'src/app/_classes/avto';
import { MatDialog } from '@angular/material/dialog';
import { DialogCreateGroupComponent } from '../dialog-create-group/dialog-create-group.component';
import { DialogUpdateGroupComponent } from '../dialog-update-group/dialog-update-group.component';
import { ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-list-groups',
  templateUrl: './list-groups.component.html',
  styleUrls: ['../../_css/sidenav_menu.scss']
})
export class ListGroupsComponent implements OnInit, OnDestroy {
  groupList: GroupStruct[] = [];
  selected: GroupStruct = null;
  private destroy: ReplaySubject<boolean> = new ReplaySubject(1);

  constructor(
    private groupService: GroupService,
    private avtoService: AvtoService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
  ) { }

  ngOnInit() {
    this.groupService.selected.pipe(
      takeUntil(this.destroy)
    ).subscribe((group: GroupStruct) => {
      if (group) {
        console.log(777, group);
        this.selected = group;
      }
    });

    this.avtoService.selected.pipe(
      takeUntil(this.destroy)
    ).subscribe((avto: Avto) => {
      if (avto) {
        this.fetchGroups(avto.avto_id);
      }
    });
  }

  ngOnDestroy() {
    this.destroy.next();
    this.destroy.complete();
    this.dialog.closeAll();
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

  clickSelect(group: GroupStruct) {
    this.groupService.setSelected(group);
  }

  clickEditGroup(group: GroupStruct) {
    this.dialog.open(DialogUpdateGroupComponent, {
      autoFocus: false,
      data: group
    });
  }

  clickDeleteGroup(group: GroupStruct) {
    const dialog = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: 'Удалить группу?',
        message: 'Удалить группу и все её записи? Восстановление будет невозможым!',
        type: 'warn'
      },
      autoFocus: false,
    });
    dialog.afterClosed().subscribe((ok: boolean) => {
      if (!ok) {
        return;
      }

      this.groupService.delete(group.group_id).subscribe(() => {
        this.snackBar.open('Группа успешно удалена!', 'OK', {
          duration: 5000,
        });
      }, (e: HttpErrorResponse) => {
        this.snackBar.open('Что-то пошло не так!', 'OK', {
          duration: 5000,
          panelClass: 'error',
        });
      });
    });
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

  private fetchGroups(avtoID: number) {
    this.groupList = [];
    this.groupService.get(avtoID).subscribe((list: GroupStruct[]) => {
      this.groupList = list || [];

      if (this.groupList.length === 0) {
        return;
      }

      const selectedGroup = this.groupService.getSelected();
      if (!selectedGroup) {
        this.groupService.setSelected(this.groupList[0]);
      } else {
        this.selected = selectedGroup;
      }
    });
  }
}
