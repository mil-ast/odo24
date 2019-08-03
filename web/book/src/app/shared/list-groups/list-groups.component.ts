import { Component, OnInit } from '@angular/core';
import { GroupStruct, GroupService } from 'src/app/_services/groups.service';
import { AvtoService } from 'src/app/_services/avto.service';
import { Avto } from 'src/app/_classes/avto';
import { MatDialog } from '@angular/material/dialog';
import { DialogCreateGroupComponent } from '../dialog-create-group/dialog-create-group.component';
import { DialogUpdateGroupComponent } from '../dialog-update-group/dialog-update-group.component';

@Component({
  selector: 'app-list-groups',
  templateUrl: './list-groups.component.html',
  styleUrls: ['./list-groups.component.css']
})
export class ListGroupsComponent implements OnInit {
  selectedAvto: Avto = null;
  groupList: GroupStruct[] = [];
  selectedGroup: GroupStruct = null;

  constructor(
    private groupService: GroupService,
    private avtoService: AvtoService,
    private dialog: MatDialog,
  ) { }

  ngOnInit() {
    this.avtoService.selected.subscribe((avto: Avto) => {
      this.selectedAvto = avto;
      if (avto) {
        this.fetchGroups();
      }
    });
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
