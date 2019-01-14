import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatSnackBar } from '@angular/material';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import * as moment from 'moment';
import { AvtoService } from 'src/app/_services/avto.service';
import { first } from 'rxjs/operators';
import { AvtoStruct } from 'src/app/_classes/avto';
import { ServiceService, ServiceStruct } from 'src/app/_services/service.service';
import { GroupStruct, GroupService } from 'src/app/_services/groups.service';

@Component({
  selector: 'app-dialog-create-service',
  templateUrl: './dialog-create-service.component.html',
  styleUrls: ['./dialog-create-service.component.css']
})
export class DialogCreateServiceComponent implements OnInit {
  form: FormGroup;
  private selectegGroup: GroupStruct;
  private selectegAvto: AvtoStruct;

  constructor(
    private dialogRef: MatDialogRef<DialogCreateServiceComponent>,
    private snackBar: MatSnackBar,
    private serviceService: ServiceService,
    private groupService: GroupService,
    private avtoService: AvtoService,
    @Inject(MAT_DIALOG_DATA) data: any,
  ) { }

  ngOnInit() {
    this.form = new FormGroup({
      odo: new FormControl(null, [Validators.required, Validators.min(0)]),
      next_odo: new FormControl(null, Validators.min(0)),
      date: new FormControl(moment()),
      price: new FormControl(null, Validators.min(0)),
      comment: new FormControl(''),
    });

    this.avtoService.selected.pipe(first()).subscribe((avto: AvtoStruct) => {
      this.selectegAvto = avto;
      this.form.patchValue({
        odo: avto.odo,
      });
    });

    this.groupService.selected.pipe(first()).subscribe((group: GroupStruct) => {
      this.selectegGroup = group || null;
    });
  }

  submit() {
    const data: ServiceStruct = {
      avto_id: this.selectegAvto.avto_id,
      group_id: this.selectegGroup.group_id,
      odo: this.form.get('odo').value,
      next_odo: this.form.get('next_odo').value,
      date: this.form.get('date').value,
      comment: this.form.get('comment').value,
    };

    this.serviceService.create(data).subscribe((service: ServiceStruct) => {
      this.snackBar.open('Запись успешно добавлена!', 'OK');
      this.dialogRef.close(service);
    }, (err) => {
      console.error(err);
    });

    return false;
  }
}
