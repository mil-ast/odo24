import { Component, Inject } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import * as moment from 'moment';
import { MAT_DIALOG_DATA, MatSnackBar, MatDialogRef } from '@angular/material';
import { AvtoStruct } from 'src/app/_classes/avto';
import { RemindingService, Reminding } from '../../services/reminding.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-dialog-create-doc',
  templateUrl: './dialog-create-doc.component.html',
  styleUrls: ['./dialog-create-doc.component.css']
})
export class DialogCreateDocComponent {
  form: FormGroup;

  constructor(
    private remindingService: RemindingService,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<DialogCreateDocComponent>,
    @Inject(MAT_DIALOG_DATA) private avto: AvtoStruct,
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
    const data = {
      avto_id: this.avto.avto_id,
      event_type: this.form.value.event_type,
      date_start: this.form.value.date_start,
      date_end: this.form.value.date_end,
      days_before_event: this.form.value.days_before_event,
      comment: this.form.value.comment,
    };
    this.remindingService.create(data).subscribe((rem: Reminding) => {
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
