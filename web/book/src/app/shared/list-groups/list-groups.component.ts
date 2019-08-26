import { Component, OnInit, OnDestroy } from '@angular/core';
import { GroupStruct, GroupService } from 'src/app/_services/groups.service';
import { AvtoService } from 'src/app/_services/avto.service';
import { Avto } from 'src/app/_classes/avto';
import { MatDialog } from '@angular/material/dialog';
import { DialogCreateGroupComponent } from '../dialog-create-group/dialog-create-group.component';
import { DialogUpdateGroupComponent } from '../dialog-update-group/dialog-update-group.component';
import { ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-list-groups',
  templateUrl: './list-groups.component.html',
})
export class ListGroupsComponent implements OnInit, OnDestroy {
  groupList: GroupStruct[] = [];
  selectedGroup: GroupStruct = null;
  private destroy: ReplaySubject<boolean> = new ReplaySubject(1);

  constructor(
    private groupService: GroupService,
    private avtoService: AvtoService,
    private dialog: MatDialog,
  ) { }

  ngOnInit() {
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

  clickEditGroup(group: GroupStruct) {
    this.dialog.open(DialogUpdateGroupComponent, {
      autoFocus: false,
      data: group
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
