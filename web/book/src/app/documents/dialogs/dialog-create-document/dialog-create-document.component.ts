import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import * as moment from 'moment';

@Component({
  selector: 'app-dialog-create-document',
  templateUrl: './dialog-create-document.component.html',
  styleUrls: [
    './dialog-create-document.component.scss',
    '../../../shared_styles/dialogs_form.scss'
  ]
})
export class DialogCreateDocumentComponent implements OnInit {
  form: FormGroup;
  startDate: moment.Moment;

  constructor(
    private fb: FormBuilder,
  ) {
    this.startDate = moment();
    this.form = this.fb.group({
      auto_id: null,
      date_start: null,
      date_end: null,
      description: null,
      doc_type_id: 2,
    });
  }

  ngOnInit(): void {
  }

}
