import { Component, OnInit, Inject } from '@angular/core';
import { DocumentsService, Document } from '../../services/documents.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import * as moment from 'moment';

@Component({
  selector: 'app-dialog-update-doc',
  templateUrl: './dialog-update-doc.component.html',
  styleUrls: ['../../../_css/dialogs_form.scss']
})
export class DialogUpdateDocComponent implements OnInit {
  form: FormGroup;

  constructor(
    private remindingService: DocumentsService,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<DialogUpdateDocComponent>,
    @Inject(MAT_DIALOG_DATA) private doc: Document,
  ) { }

  ngOnInit() {
    this.form = new FormGroup({
      event_type: new FormControl({value: this.doc.event_type, disabled: true}),
      date_start: new FormControl(this.doc.date_start, Validators.required),
      date_end: new FormControl(this.doc.date_end, Validators.required),
      days_before_event: new FormControl(this.doc.days_before_event, Validators.required),
      comment: new FormControl(this.doc.comment),
    });
  }

  submit() {
    const dateFrom = moment(this.form.value.date_start).format('YYYY-MM-DD');
    const dateTo = moment(this.form.value.date_end).format('YYYY-MM-DD');

    console.log(this.form.value.date_end, dateTo);

    const data = {
      id: this.doc.id,
      date_start: dateFrom,
      date_end: dateTo,
      days_before_event: this.form.value.days_before_event,
      comment: this.form.value.comment,
    };
    this.remindingService.update(data).subscribe((rem: Document) => {
      this.snackBar.open('Документ успешно изменён!', 'OK', {
        duration: 5000,
      });

      this.dialogRef.close(rem);
    }, (e: HttpErrorResponse) => {
      console.error(e);
      this.snackBar.open('Что-то пошло не так!', 'OK', {
        duration: 5000,
        panelClass: 'error',
      });
    });
  }
}
