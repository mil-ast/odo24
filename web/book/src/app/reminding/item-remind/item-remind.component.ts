import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Reminding, RemindingService } from '../services/reminding.service';
import { MatDialog, MatSnackBar } from '@angular/material';
import { DialogUpdateDocComponent } from '../dialogs/dialog-update-doc/dialog-update-doc.component';
import { ConfirmationDialogComponent } from 'src/app/shared/confirmation-dialog/confirmation-dialog.component';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-item-remind',
  templateUrl: './item-remind.component.html',
  styleUrls: [
    '../../_css/item_list.css',
    './item-remind.component.css'
  ]
})
export class ItemRemindComponent {
  @Input() model: Reminding;
  @Output() delete: EventEmitter<Reminding> = new EventEmitter();

  constructor(
    private remindingService: RemindingService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
  ) { }

  clickEdit() {
    this.dialog.open(DialogUpdateDocComponent, {
      width: '600px',
      data: this.model
    }).afterClosed().subscribe((rem: Reminding) => {
      if (rem) {
        this.model.date_start = rem.date_start;
        this.model.date_end = rem.date_end;
        this.model.days_before_event = rem.days_before_event;
        this.model.comment = rem.comment;
      }
    });
  }

  clickDelete() {
    const dialog = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: 'Удалить документ?',
        message: 'Восстановление будет невозможым!',
        type: 'warn'
      }
    });
    dialog.afterClosed().subscribe((ok: boolean) => {
      if (!ok) {
        return;
      }

      this.remindingService.delete(this.model.id).subscribe(() => {
        this.delete.emit(this.model);
        this.snackBar.open('Документ успешно удалён!', 'OK');
      }, (err: HttpErrorResponse) => {
        console.error(err);
        this.snackBar.open('Что-то пошло не так!', 'OK', {
          panelClass: 'error',
        });
      });
    });
  }
}
