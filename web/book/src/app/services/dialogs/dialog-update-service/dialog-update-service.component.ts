import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { ServiceService, ServiceStruct, Service } from 'src/app/services/services/service.service';
import { ToastrService } from 'ngx-toastr';
import * as moment from 'moment';

@Component({
  selector: 'app-dialog-update-service',
  templateUrl: './dialog-update-service.component.html',
  styleUrls: ['../../../shared_styles/dialogs_form.scss']
})
export class DialogUpdateServiceComponent implements OnInit {
  form: FormGroup;

  constructor(
    private dialogRef: MatDialogRef<DialogUpdateServiceComponent>,
    private toastr: ToastrService,
    private serviceService: ServiceService,
    @Inject(MAT_DIALOG_DATA) public service: ServiceStruct,
  ) { }

  ngOnInit() {
    this.form = new FormGroup({
      odo: new FormControl(this.service.odo, [Validators.required, Validators.min(0)]),
      next_distance: new FormControl(this.service.next_distance, Validators.min(0)),
      dt: new FormControl(moment(this.service.dt), Validators.required),
      price: new FormControl(this.service.price, Validators.min(0)),
      description: new FormControl(this.service.description),
    });
  }

  submit() {
    const data: Service = {
      odo: this.form.get('odo').value,
      next_distance: this.form.get('next_distance').value,
      dt: this.form.get('dt').value.format('YYYY-MM-DD'),
      price: this.form.get('price').value,
      description: this.form.get('description').value,
    };

    this.serviceService.update(this.service.service_id, data).subscribe(() => {
      this.toastr.success('Запись успешно изменена!');

      this.service.odo = data.odo;
      this.service.next_distance = data.next_distance;
      this.service.dt = data.dt;
      this.service.price = data.price;
      this.service.description = data.description;
      
      this.dialogRef.close();
    }, () => {
      this.toastr.error('Что-то пошло не так!');
    });

    return false;
  }
}
