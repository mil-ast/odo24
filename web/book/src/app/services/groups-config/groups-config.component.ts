import { Component, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { GroupStruct, GroupService } from 'src/app/_services/groups.service';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material';
import { DialogUpdateGroupComponent } from 'src/app/shared/dialog-update-group/dialog-update-group.component';
import { ConfirmationDialogComponent } from 'src/app/shared/confirmation-dialog/confirmation-dialog.component';
import { DialogCreateGroupComponent } from 'src/app/shared/dialog-create-group/dialog-create-group.component';

@Component({
  selector: 'app-groups-config',
  templateUrl: './groups-config.component.html',
  styleUrls: ['./groups-config.component.scss']
})
export class GroupsConfigComponent implements OnDestroy {
  @Input() groups: GroupStruct[];
  @Output() close: EventEmitter<void> = new EventEmitter();
  constructor(
    private groupService: GroupService,
    private dialog: MatDialog,
    private toastr: ToastrService,
  ) { }

  ngOnDestroy() {
    this.dialog.closeAll();
  }

  clickClose() {
    this.close.emit();
  }

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

  clickDeleteGroup(group: GroupStruct) {
    this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: group.group_name,
        message: 'Вы действительно хотите удалить группу и её записи об обслуживании?',
        type: 'warn'
      },
    }).afterClosed().subscribe((ok: boolean) => {
      if (ok) {
        this.groupService.delete(group.group_id).subscribe(() => {
          const index = this.groups.indexOf(group);
          if (index !== -1) {
            this.groups.splice(index, 1);
          }
        }, (err: HttpErrorResponse) => {
          console.log(err);
          this.toastr.error('Не удалось удалить группу :(');
        });
      }
    });
  }
}
