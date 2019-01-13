import { Component, Input, Output, EventEmitter } from '@angular/core';
import { GroupStruct, GroupService } from 'src/app/_services/groups.service';
import { MatDialog, MatSnackBar } from '@angular/material';
import { DialogUpdateGroupComponent } from '../dialogs/dialog-update-group/dialog-update-group.component';
import { ConfirmationDialogComponent } from 'src/app/shared/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-item-group',
  templateUrl: './item-group.component.html',
  styleUrls: [
    './item-group.component.css',
    '../../_css/item_list.css'
  ]
})
export class ItemGroupComponent {
  @Input() model: GroupStruct;
  @Output() eventDelete: EventEmitter<GroupStruct> = new EventEmitter();

  constructor(
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private groupService: GroupService
  ) { }

  get selected(): boolean {
    return this.groupService.isSelected(this.model);
  }

  clickSelect(event: MouseEvent) {
    event.preventDefault();
    this.groupService.setSelected(this.model);
  }

  clickEdit() {
    this.dialog.open(DialogUpdateGroupComponent, {
      width: '500px',
      data: this.model
    });
  }

  clickDelete() {
    const dialog = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: 'Удалить группу?',
        message: 'Удалить группу и все её записи? Восстановление будет невозможым!',
        type: 'warn'
      }
    });
    dialog.afterClosed().subscribe((ok: boolean) => {
      if (!ok) {
        return;
      }

      this.groupService.delete(this.model.group_id).subscribe(() => {
        this.eventDelete.emit(this.model);

        this.snackBar.open('Группа успешно удалена!', 'OK', {
          duration: 5000,
        });
      }, (e) => {
        console.error(e);
        this.snackBar.open('Что-то пошло не так!', 'OK', {
          duration: 5000,
          panelClass: 'error',
        });
      });
    });
  }
}
