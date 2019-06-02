import { Component, Inject } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import * as moment from 'moment';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AvtoStruct } from 'src/app/_classes/avto';
import { DocumentsService, Document } from '../../services/documents.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-dialog-create-doc',
  templateUrl: './dialog-create-doc.component.html',
  styleUrls: ['../../../_css/dialogs_form.scss']
})
export class DialogCreateDocComponent {
  form: FormGroup;

  constructor(
    private remindingService: DocumentsService,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<DialogCreateDocComponent>,
    @Inject(MAT_DIALOG_DATA) public avto: AvtoStruct,
  ) {
    this.form = new FormGroup({
      event_type: new FormControl('insurance', Validators.required),
      date_start: new FormControl(moment(), Validators.required),
      date_end: new FormControl(moment().add(1, 'y'), Validators.required),
      days_before_event: new FormControl(30, Validators.required),
      comment: new FormControl(null),
    });
  }

  submit() {
    const dateFrom = moment(this.form.value.date_start).format('YYYY-MM-DD');
    const dateTo = moment(this.form.value.date_end).format('YYYY-MM-DD');

    const avtoID = this.avto ? this.avto.avto_id : null;
    const data = {
      avto_id: avtoID,
      event_type: this.form.value.event_type,
      date_start: dateFrom,
      date_end: dateTo,
      days_before_event: this.form.value.days_before_event,
      comment: this.form.value.comment,
    };
    this.remindingService.create(data).subscribe((rem: Document) => {
      this.snackBar.open('Документ успешно добавлен!', 'OK', {
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
