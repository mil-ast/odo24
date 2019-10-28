import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import * as moment from 'moment';
import { AutoService } from 'src/app/_services/avto.service';
import { first } from 'rxjs/operators';
import { AutoStruct } from 'src/app/_classes/auto';
import { ServiceService, ServiceStruct } from 'src/app/_services/service.service';
import { GroupStruct, GroupService } from 'src/app/_services/groups.service';

@Component({
  selector: 'app-dialog-create-service',
  templateUrl: './dialog-create-service.component.html',
  styleUrls: ['../../../_css/dialogs_form.scss']
})
export class DialogCreateServiceComponent implements OnInit {
  form: FormGroup;
  private selectegGroup: GroupStruct;
  private selectegAvto: AutoStruct;

  constructor(
    private dialogRef: MatDialogRef<DialogCreateServiceComponent>,
    private snackBar: MatSnackBar,
    private serviceService: ServiceService,
    private groupService: GroupService,
    private avtoService: AutoService,
  ) { }

  ngOnInit() {
    this.form = new FormGroup({
      odo: new FormControl(null, [Validators.required, Validators.min(0)]),
      next_distance: new FormControl(null, Validators.min(0)),
      date: new FormControl(moment(), Validators.required),
      price: new FormControl(null, Validators.min(0)),
      comment: new FormControl(''),
    });

    this.avtoService.selected.pipe(first()).subscribe((avto: AutoStruct) => {
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
      next_distance: this.form.get('next_distance').value,
      date: this.form.get('date').value.format('YYYY-MM-DD'),
      price: this.form.get('price').value,
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
