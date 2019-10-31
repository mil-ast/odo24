import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import * as moment from 'moment';
import { AutoService } from 'src/app/_services/avto.service';
import { first } from 'rxjs/operators';
import { AutoStruct } from 'src/app/_classes/auto';
import { ServiceService, ServiceStruct, ServiceCreate } from 'src/app/_services/service.service';
import { GroupStruct, GroupService } from 'src/app/_services/groups.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-dialog-create-service',
  templateUrl: './dialog-create-service.component.html',
  styleUrls: [
    '../../../_css/dialogs_form.scss'
  ]
})
export class DialogCreateServiceComponent implements OnInit {
  form: FormGroup;

  constructor(
    private dialogRef: MatDialogRef<DialogCreateServiceComponent>,
    private toastr: ToastrService,
    private serviceService: ServiceService,
    @Inject(MAT_DIALOG_DATA) private data: {
      auto_id: number,
      group_id: number,
      odo: number,
    },
  ) { }

  ngOnInit() {
    this.form = new FormGroup({
      odo: new FormControl(this.data.odo, [Validators.required, Validators.min(0)]),
      next_distance: new FormControl(null, Validators.min(0)),
      date: new FormControl(moment(), Validators.required),
      price: new FormControl(null, Validators.min(0)),
      description: new FormControl(''),
    });
  }

  submit() {
    const data: ServiceCreate = {
      auto_id: this.data.auto_id,
      group_id: this.data.group_id,
      odo: this.form.get('odo').value,
      next_distance: this.form.get('next_distance').value,
      dt: this.form.get('date').value.format('YYYY-MM-DD'),
      price: this.form.get('price').value,
      description: this.form.get('description').value,
    };

    this.serviceService.create(data).subscribe((service: ServiceStruct) => {
      this.toastr.success('Запись успешно добавлена!');
      this.dialogRef.close(service);
    }, (err) => {
      console.error(err);
      this.toastr.error('Произошла ошибка при добавлении сервиса');
    });

    return false;
  }
}
