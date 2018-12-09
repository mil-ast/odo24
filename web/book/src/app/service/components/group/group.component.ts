import { Component, Input, Output, EventEmitter } from '@angular/core';
import { GroupsService } from '../../services/groups.service';
import { MatDialog } from '@angular/material';
import { Group } from '../../classes/group';
// диалоги
import { DialogGroupUpdateComponent } from '../../dialogs/group-update/group-update.component';

@Component({
  selector: 'app-group',
  templateUrl: './group.component.html',
  styleUrls: ['../../../_css/list_styles.css', './group.component.css']
})
export class GroupComponent {
  @Input() model: Group;
  @Output() selectGroupEvent: EventEmitter<Group> = new EventEmitter();
  @Output() deleteGroupEvent: EventEmitter<Group> = new EventEmitter();

  constructor(
    public dialogAvtoUpdate: MatDialog,
    private serviceGroup: GroupsService,
  ) { }

  ClickSelectGroup() {
    this.selectGroupEvent.emit(this.model);
    return false;
  }

  ShowFormUpdateGroup() {
    const dialogRef = this.dialogAvtoUpdate.open(DialogGroupUpdateComponent, {
      width: '400px',
      position: {
        top: '200px',
        left: '300px',
      },
      data: this.model
    });

    dialogRef.afterClosed().subscribe((result: Group) => { });

    return false;
  }

  /* удалить группу */
  ClickDelete() {
    if (!confirm('Удалить группу и все её записи?')) {
      return false;
    }

    const req = this.serviceGroup.Delete(this.model.group_id);
    req.subscribe(() => {
      // очистим сервисы
      this.model.services = [];
      // удалим из списка
      this.deleteGroupEvent.emit(this.model);
    }, (err) => {
      console.error(err);
    });

    return false;
  }
}
