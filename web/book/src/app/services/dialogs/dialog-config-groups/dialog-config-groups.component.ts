import { Component, Inject } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material';
import { moveItemInArray, CdkDragDrop } from '@angular/cdk/drag-drop';
import { HttpErrorResponse } from '@angular/common/http';
import { GroupService, GroupStruct } from 'src/app/_services/groups.service';
import { DialogUpdateGroupComponent } from 'src/app/services/dialogs/dialog-update-group/dialog-update-group.component';
import { ToastrService } from 'ngx-toastr';
import { DialogCreateGroupComponent } from '../dialog-create-group/dialog-create-group.component';

@Component({
  selector: 'app-dialog-config-groups',
  templateUrl: './dialog-config-groups.component.html',
  styleUrls: ['./dialog-config-groups.component.scss']
})
export class DialogConfigGroupsComponent {
  constructor(
    private groupService: GroupService,
    private dialog: MatDialog,
    private toastr: ToastrService,
    @Inject(MAT_DIALOG_DATA) public groups: GroupStruct[],
  ) { }

  drop(event: CdkDragDrop<GroupStruct[]>) {
    moveItemInArray(this.groups, event.previousIndex, event.currentIndex);

    this.groupService.saveNewSort(this.groups).subscribe({error: (err: HttpErrorResponse) => {
      console.log(err);
      this.toastr.error('Не удалось сохранить сортировку :(');
    }});
  }

  clickEditGroup(group: GroupStruct) {
    this.dialog.open(DialogUpdateGroupComponent, {
      data: group,
    });
  }

  clickNewGroup() {
    this.dialog.open(DialogCreateGroupComponent).afterClosed().subscribe((group: GroupStruct) => {
      if (group) {
        this.groups.push(group);
      }
    });
  }
}
