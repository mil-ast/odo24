import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ServiceStruct, ServiceService } from 'src/app/_services/service.service';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { DialogUpdateServiceComponent } from '../dialogs/dialog-update-service/dialog-update-service.component';
import { ConfirmationDialogComponent } from 'src/app/shared/confirmation-dialog/confirmation-dialog.component';
import { AsideService } from 'src/app/_services/aside.service';
import { ToastrService } from 'ngx-toastr';

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
  isMobile = false;

  constructor(
    private serviceService: ServiceService,
    private asideService: AsideService,
    private dialog: MatDialog,
    private toastr: ToastrService,
  ) {
    this.isMobile = this.asideService.isMobile();
  }

  clickEdit() {
    const config: MatDialogConfig = {
      minWidth: '600px',
      autoFocus: false,
      data: this.model
    };
    if (this.isMobile) {
      config.minWidth = '98%';
      config.position = {
        top: '1%'
      };
    }

    this.dialog.open(DialogUpdateServiceComponent, config);
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
      this.deleteService();
    });
  }

  private deleteService() {
    this.serviceService.delete(this.model.service_id).subscribe(() => {
      this.eventOnDelete.emit(this.model);
      this.toastr.success('Сервис успешно удалён!');
    }, (err) => {
      console.error(err);
      this.toastr.error('Ошибка удаления сервиса');
    });
  }
}
