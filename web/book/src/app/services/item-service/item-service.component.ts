import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ServiceStruct, ServiceService } from 'src/app/_services/service.service';
import { MatDialog, MatSnackBar } from '@angular/material';
import { DialogUpdateServiceComponent } from '../dialogs/dialog-update-service/dialog-update-service.component';
import { ConfirmationDialogComponent } from 'src/app/shared/confirmation-dialog/confirmation-dialog.component';
import { ScreenService, Screen } from 'src/app/_services/screen.service';
import { first } from 'rxjs/operators';

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
    private screenpService: ScreenService
  ) { }

  clickEdit() {
    this.screenpService.getScreen().pipe(first()).subscribe((screen: Screen) => {
      const config = {
        minWidth: '600px',
        data: this.model
      };

      if (screen.innerWidth < 600) {
        config.minWidth = '98%';
      }

      this.dialog.open(DialogUpdateServiceComponent, config);
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
