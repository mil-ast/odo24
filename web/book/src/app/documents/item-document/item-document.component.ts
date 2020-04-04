import { Component, OnInit, Input, OnDestroy, Output, EventEmitter } from '@angular/core';
import { DocumentsService, Document } from '../services/documents.service';
import { MatDialog } from '@angular/material/dialog';
import { DialogUpdateDocumentComponent } from '../dialogs/dialog-update-document/dialog-update-document.component';
import { ConfirmationDialogComponent } from 'src/app/shared/confirmation-dialog/confirmation-dialog.component';
import { ReplaySubject, of, throwError } from 'rxjs';
import { mergeMap, takeUntil, catchError, tap, mapTo } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-item-document',
  templateUrl: './item-document.component.html',
  styleUrls: ['./item-document.component.scss']
})
export class ItemDocumentComponent implements OnDestroy {
  @Input() doc: Document;
  @Output() deleteDocument: EventEmitter<Document> = new EventEmitter();

  private destroy$: ReplaySubject<void> = new ReplaySubject(1);

  constructor(
    private documentsService: DocumentsService,
    private dialog: MatDialog,
    private toastr: ToastrService,
  ) { }

  ngOnDestroy(): void {
    this.dialog.closeAll();
    this.destroy$.next();
    this.destroy$.complete();
  }

  clickEdit(): void {
    this.dialog.open(DialogUpdateDocumentComponent, {
      data: this.doc,
    });
  }

  clickDelete() {
    const docName = this.doc.doc_type_id === 1 ? 'водительское удостоверения' : 'страховку';

    this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: 'Удаление документа',
        message: `Вы действительно хотите удалить ${docName}?`,
        type: 'warn',
      }
    }).afterClosed().pipe(
      mergeMap((ok: boolean) => {
        if (!ok) {
          return of(false);
        }
        return this.documentsService.delete(this.doc.doc_id).pipe(mapTo(true));
      }),
      takeUntil(this.destroy$)
    ).subscribe((ok: boolean) => {
      if (ok) {
        this.toastr.success('Документ успешно удалён');
        this.deleteDocument.next(this.doc);
      }
    }, (err: HttpErrorResponse) => {
      console.log(err);
      this.toastr.error('Произошла ошибка при удалении документа');
    });
  }
}
