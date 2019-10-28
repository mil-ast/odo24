import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { AutoService } from 'src/app/_services/avto.service';
import { AutoStruct } from 'src/app/_classes/auto';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-dialog-create-avto',
  templateUrl: './dialog-create-avto.component.html',
})
export class DialogCreateAvtoComponent {
  constructor(
    private dialogRef: MatDialogRef<DialogCreateAvtoComponent>,
    private snackBar: MatSnackBar,
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
      this.snackBar.open('Авто успешно добавлена!', 'OK', {
        duration: 5000,
      });

      this.dialogRef.close(avto);
    }, (e: HttpErrorResponse) => {
      console.error(e);
      this.snackBar.open('Что-то пошло не так!', 'OK', {
        duration: 5000,
        panelClass: 'error',
      });
    });

    return false;
  }

  get isDisableClose(): boolean {
    return this.dialogRef.disableClose;
  }
}
