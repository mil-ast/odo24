import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Document, DocumentsService } from '../services/documents.service';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DialogUpdateDocComponent } from '../dialogs/dialog-update-doc/dialog-update-doc.component';
import { ConfirmationDialogComponent } from 'src/app/shared/confirmation-dialog/confirmation-dialog.component';
import { HttpErrorResponse } from '@angular/common/http';
import { ScreenService, Screen } from 'src/app/_services/screen.service';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-item-remind',
  templateUrl: './item-remind.component.html',
  styleUrls: [
    './item-remind.component.scss'
  ]
})
export class ItemRemindComponent {
  @Input() model: Document;
  @Output() delete: EventEmitter<Document> = new EventEmitter();

  constructor(
    private remindingService: DocumentsService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private screenService: ScreenService,
  ) { }

  clickEdit() {
    this.screenService.getScreen().pipe(first()).subscribe((screen: Screen) => {
      const config: MatDialogConfig = {
        minWidth: '600px',
        autoFocus: false,
        data: this.model
      };
      if (screen.innerWidth < 600) {
        config.minWidth = '98%';
        config.position = {
          top: '4px'
        };
      }

      this.dialog.open(DialogUpdateDocComponent, config).afterClosed().subscribe((rem: Document) => {
        if (rem) {
          this.model.date_start = rem.date_start;
          this.model.date_end = rem.date_end;
          this.model.days_before_event = rem.days_before_event;
          this.model.comment = rem.comment;
        }
      });
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
