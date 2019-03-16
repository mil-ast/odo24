import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ServiceStruct, ServiceService } from 'src/app/_services/service.service';
import { MatDialog, MatSnackBar } from '@angular/material';
import { DialogUpdateServiceComponent } from '../dialogs/dialog-update-service/dialog-update-service.component';
import { ConfirmationDialogComponent } from 'src/app/shared/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-item-service',
  templateUrl: './item-service.component.html',
  styleUrls: [
    './item-service.component.scss',
  ]
})
export class ItemServiceComponent {
  @Input() model: ServiceStruct;
  @Output() eventOnDelete: EventEmitter<ServiceStruct> = new EventEmitter();

  constructor(
    private serviceService: ServiceService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
  ) { }

  clickEdit() {
    this.dialog.open(DialogUpdateServiceComponent, {
      autoFocus: true,
      width: '600px',
      data: this.model
    });
  }

  clickDelete() {
    const dialog = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: 'Удалить сервис?',
        message: 'Восстановление будет невозможым!',
        type: 'warn'
      }
    });
    dialog.afterClosed().subscribe((ok: boolean) => {
      if (!ok) {
        return;
      }

      this.serviceService.delete(this.model.service_id).subscribe(() => {
        this.eventOnDelete.emit(this.model);
        this.snackBar.open('Запись успешно изменена!', 'OK');
      }, (err) => {
        console.error(err);
        this.snackBar.open('Что-то пошло не так!', 'OK', {
          panelClass: 'error',
        });
      });
    });
  }
}
