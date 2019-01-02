import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MatDialog } from '@angular/material';
import { AvtoService } from '../../../_services/avto.service';
import { Avto } from '../../../_classes/avto';

// диалоги
import { DialogAvtoUpdateComponent } from '../../dialogs/avto-update/avto-update.component';

@Component({
  selector: 'app-avto',
  templateUrl: './avto.component.html',
  styleUrls: [
    '../../../_css/list_styles.css',
    '../../../_css/avto_item.css',
    './avto.component.css'
  ]
})
export class AvtoComponent {
  @Input() model: Avto;
  @Input() selected: boolean;
  @Output() eventSelectAvto: EventEmitter<Avto> = new EventEmitter();
  @Output() eventDeleteAvto: EventEmitter<Avto> = new EventEmitter();

  constructor(
    public dialogAvtoUpdate: MatDialog,
    private avtoService: AvtoService,
  ) { }

  ClickSelectAvto() {
    this.eventSelectAvto.emit(this.model);
    return false;
  }

  ShowFormUpdateAvto() {
    const dialogRef = this.dialogAvtoUpdate.open(DialogAvtoUpdateComponent, {
      width: '400px',
      position: {
        top: '20px',
        left: '20px',
      },
      data: this.model
    });

    dialogRef.afterClosed().subscribe((result: Avto) => { });

    return false;
  }

  ClickDelete() {
    if (!confirm('Удалить авто и все её записи?')) {
      return false;
    }

    const req = this.avtoService.Delete(this.model.avto_id);
    req.subscribe(() => {
      this.eventDeleteAvto.emit(this.model);
    }, (err) => {
      console.error(err);
    });
    return false;
  }
}