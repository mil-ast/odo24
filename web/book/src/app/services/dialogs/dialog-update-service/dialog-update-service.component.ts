import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatSnackBar } from '@angular/material';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import * as moment from 'moment';
import { ServiceService, ServiceStruct } from 'src/app/_services/service.service';

@Component({
  selector: 'app-dialog-update-service',
  templateUrl: './dialog-update-service.component.html',
  styleUrls: ['./dialog-update-service.component.css']
})
export class DialogUpdateServiceComponent implements OnInit {
  form: FormGroup;

  constructor(
    private dialogRef: MatDialogRef<DialogUpdateServiceComponent>,
    private snackBar: MatSnackBar,
    private serviceService: ServiceService,
    @Inject(MAT_DIALOG_DATA) public data: ServiceStruct,
  ) { }

  ngOnInit() {
    this.form = new FormGroup({
      odo: new FormControl(this.data.odo, [Validators.required, Validators.min(0)]),
      next_distance: new FormControl(this.data.next_distance, Validators.min(0)),
      date: new FormControl(this.data.date, Validators.required),
      price: new FormControl(this.data.price, Validators.min(0)),
      comment: new FormControl(this.data.comment),
    });
  }

  submit() {
    const data: ServiceStruct = {
      service_id: this.data.service_id,
      odo: this.form.get('odo').value,
      next_distance: this.form.get('next_distance').value,
      date: this.form.get('date').value,
      price: this.form.get('price').value,
      comment: this.form.get('comment').value,
    };

    this.serviceService.update(data).subscribe((service: ServiceStruct) => {
      this.data = Object.assign(this.data, service);

      this.snackBar.open('Запись успешно изменена!', 'OK');
      this.dialogRef.close();
    }, (err) => {
      console.error(err);
      this.snackBar.open('Что-то пошло не так!', 'OK', {
        panelClass: 'error',
      });
    });

    return false;
  }
}
