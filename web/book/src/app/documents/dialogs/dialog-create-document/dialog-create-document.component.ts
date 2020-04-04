import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { Auto } from '../../../_classes/auto';
import * as moment from 'moment';
import { AutoService } from 'src/app/_services/avto.service';
import { Observable, ReplaySubject } from 'rxjs';
import { takeUntil, tap, first } from 'rxjs/operators';
import { DocumentsService, Document } from '../../services/documents.service';
import { MatDialogRef } from '@angular/material/dialog';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-dialog-create-document',
  templateUrl: './dialog-create-document.component.html',
  styleUrls: [
    './dialog-create-document.component.scss',
    '../../../shared_styles/dialogs_form.scss'
  ]
})
export class DialogCreateDocumentComponent implements OnDestroy {
  form: FormGroup;
  startDate: moment.Moment;
  cars$: Observable<Auto[]>;
  destroy$: ReplaySubject<void> = new ReplaySubject(1);

  constructor(
    private autoService: AutoService,
    private documentsService: DocumentsService,
    private dialogRef: MatDialogRef<DialogCreateDocumentComponent>,
    private fb: FormBuilder,
    private toastr: ToastrService,
  ) {
    this.startDate = moment();
    this.form = this.fb.group({
      auto_id: new FormControl(null),
      date_start: new FormControl(null),
      date_end: new FormControl(null, Validators.required),
      description: new FormControl(null),
      doc_type_id: new FormControl(2),
    });

    this.cars$ = this.autoService.getAuto().pipe(
      first(),
      tap((cars: Auto[]) => {
        if (Array.isArray(cars) && cars.length === 1) {
          this.form.controls.auto_id.setValue(cars[0].auto_id);
        }
      }),
      takeUntil(this.destroy$)
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  submit(): void {
    const controls = this.form.controls;
    const autoID = controls.auto_id.value || null;
    const dtStart = controls.date_start.value ? controls.date_start.value.format('YYYY-MM-DDTHH:mm:ss') : null;
    const dtEnd = controls.date_end.value.format('YYYY-MM-DDTHH:mm:ss');
    const descript = controls.description.value || null;
    const docTypeID = controls.doc_type_id.value;
    this.documentsService.create(autoID, dtStart, dtEnd, descript, docTypeID).subscribe((res: {doc_id: number}) => {
      this.toastr.success('Документ успешно добавлен!');

      const doc: Document = {
        doc_id: res.doc_id,
        date_start: dtStart,
        date_end: dtEnd,
        auto_id: autoID,
        doc_type_id: docTypeID,
        descript: descript,
        is_closed: false,
      };
      this.dialogRef.close(doc);
    }, (err: HttpErrorResponse) => {
      console.log(err);
      this.toastr.error('Произошла ошибка при добавлении документа');
    });
  }
}
