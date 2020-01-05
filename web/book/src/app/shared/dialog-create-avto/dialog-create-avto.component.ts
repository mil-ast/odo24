import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { AutoService } from 'src/app/_services/avto.service';
import { AutoStruct } from 'src/app/_classes/auto';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-dialog-create-avto',
  templateUrl: './dialog-create-avto.component.html',
})
export class DialogCreateAvtoComponent {
  constructor(
    private dialogRef: MatDialogRef<DialogCreateAvtoComponent>,
    private toastr: ToastrService,
    private avtoService: AutoService,
  ) { }

  form: FormGroup = new FormGroup({
    name : new FormControl('', Validators.required),
    odo : new FormControl(null, [Validators.required, Validators.min(0), Validators.pattern(/[\d]+/)]),
  });

  submit() {
    const data: AutoStruct = {
      name: this.form.get('name').value,
      odo: this.form.get('odo').value
    };
    this.avtoService.create(data).subscribe((avto: AutoStruct) => {
      this.toastr.success('Автомобиль успешно добавлен!');
      this.dialogRef.close(avto);
    }, (e: HttpErrorResponse) => {
      console.error(e);
      this.toastr.error('Произошла ошибка при добавлении авто!');
    });

    return false;
  }
}
