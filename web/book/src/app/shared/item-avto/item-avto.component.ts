import { Component, Input, Output, EventEmitter } from '@angular/core';
import { AvtoStruct } from 'src/app/_classes/avto';
import { AvtoService } from 'src/app/_services/avto.service';
import { MatDialog } from '@angular/material';
import { DialogUpdateAvtoComponent } from 'src/app/services/dialogs/dialog-update-avto/dialog-update-avto.component';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-item-avto',
  templateUrl: './item-avto.component.html',
  styleUrls: [
    '../../_css/item_list.css',
    './item-avto.component.css',
  ]
})
export class ItemAvtoComponent {
  @Input() model: AvtoStruct;
  @Output() eventDelete: EventEmitter<AvtoStruct> = new EventEmitter();
  constructor(
    private dialog: MatDialog,
    private avtoService: AvtoService
  ) { }

  get imageURL(): string {
    if (this.model.avatar) {
      return `/api/images/small/${this.model.avto_id}.jpg`;
    }
    return '/assets/images/no_photo_small.png';
  }

  get selected(): boolean {
    return this.avtoService.isSelected(this.model);
  }

  clickSelect(event: MouseEvent) {
    event.preventDefault();

    this.avtoService.setSelected(this.model);
  }

  clickEdit() {
    this.dialog.open(DialogUpdateAvtoComponent, {
      data: this.model,
      width: '500px'
    });
  }

  clickDelete() {
    const dialog = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: 'Удалить авто?',
        message: 'Удалить авто и всю историю по ней? Восстановление будет невозможным!',
        type: 'warn'
      },
    });
    dialog.afterClosed().subscribe((ok: boolean) => {
      if (!ok) {
        return;
      }

      this.avtoService.delete(this.model.avto_id).subscribe(() => {
        this.eventDelete.emit(this.model);
      });
    });
  }
}
