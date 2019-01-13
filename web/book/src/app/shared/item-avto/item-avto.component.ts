import { Component, Input } from '@angular/core';
import { AvtoStruct } from 'src/app/_classes/avto';
import { AvtoService } from 'src/app/_services/avto.service';
import { MatDialog } from '@angular/material';
import { DialogUpdateAvtoComponent } from 'src/app/services/dialogs/dialog-update-avto/dialog-update-avto.component';

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
    const dialog = this.dialog.open(DialogUpdateAvtoComponent, {
      data: this.model,
      width: '500px'
    });
  }
}
