import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import * as moment from 'moment';

@Component({
  selector: 'app-dialog-create-doc',
  templateUrl: './dialog-create-doc.component.html',
  styleUrls: ['./dialog-create-doc.component.css']
})
export class DialogCreateDocComponent implements OnInit {
  form: FormGroup;

  constructor() {
    this.form = new FormGroup({
      event_type: new FormControl('insurance', Validators.required),
      date_start: new FormControl(moment(), Validators.required),
      date_end: new FormControl(moment().add(1, 'y'), Validators.required),
      days_before_event: new FormControl(30, Validators.required),
      comment: new FormControl(null),
    });
  }

  ngOnInit() {

  }

  submit() {

  }
}
