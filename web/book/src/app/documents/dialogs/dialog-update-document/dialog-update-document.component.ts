import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { AutoService } from 'src/app/_services/avto.service';
import { DocumentsService, Document } from '../../services/documents.service';
import { DialogCreateDocumentComponent } from '../dialog-create-document/dialog-create-document.component';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Observable, ReplaySubject } from 'rxjs';
import { Auto } from 'src/app/_classes/auto';
import { first, tap, takeUntil } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import * as moment from 'moment';

@Component({
  selector: 'app-dialog-update-document',
  templateUrl: './dialog-update-document.component.html',
  styleUrls: ['./dialog-update-document.component.scss']
})
export class DialogUpdateDocumentComponent implements OnInit, OnDestroy {
  form: FormGroup;
  cars$: Observable<Auto[]>;
  destroy$: ReplaySubject<void> = new ReplaySubject(1);

  constructor(
    private autoService: AutoService,
    private documentsService: DocumentsService,
    private dialogRef: MatDialogRef<DialogCreateDocumentComponent>,
    private fb: FormBuilder,
    private toastr: ToastrService,
    @Inject(MAT_DIALOG_DATA) public document: Document,
  ) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      auto_id: new FormControl(this.document.auto_id),
      date_start: new FormControl(this.document.date_start ? moment(this.document.date_start) : null),
      date_end: new FormControl(moment(this.document.date_end), Validators.required),
      description: new FormControl(this.document.descript),
      doc_type_id: new FormControl(this.document.auto_id),
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
    console.log(controls);
    const autoID = controls.auto_id.value || null;
    const dtStart = controls.date_start.value ? controls.date_start.value.format('YYYY-MM-DDTHH:mm:ss') : null;
    const dtEnd = controls.date_end.value.format('YYYY-MM-DDTHH:mm:ss');
    const descript = controls.description.value || null;

    this.documentsService.update(this.document.doc_id, autoID, dtStart, dtEnd, descript).subscribe(() => {
      this.toastr.success('Изменения успешно сохранены!');
      this.document.auto_id = autoID;
      this.document.date_start = controls.date_start.value;
      this.document.date_end = controls.date_end.value;
      this.document.descript = descript;
      this.dialogRef.close(this.document);
    }, (err: HttpErrorResponse) => {
      console.log(err);
      this.toastr.error('Произошла ошибка при редактировании документа');
    });
  }
}
