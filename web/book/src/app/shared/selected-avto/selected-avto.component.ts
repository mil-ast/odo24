import { Component, Input } from '@angular/core';
import { AvtoStruct } from '../../_classes/avto';
import { MatDialog } from '@angular/material';
import { DialogUpdateAvtoComponent } from 'src/app/services/dialogs/dialog-update-avto/dialog-update-avto.component';

@Component({
  selector: 'app-selected-avto',
  templateUrl: './selected-avto.component.html',
  styleUrls: ['./selected-avto.component.scss']
})
export class SelectedAvtoComponent {
  @Input() model: AvtoStruct;

  constructor(
    private dialog: MatDialog,
  ) { }

  clickEdit(event: MouseEvent) {
    event.preventDefault();
    this.dialog.open(DialogUpdateAvtoComponent, {
      data: this.model,
      width: '500px'
    });
  }
}
