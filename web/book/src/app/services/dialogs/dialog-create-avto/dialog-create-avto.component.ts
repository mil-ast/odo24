import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { AvtoService } from 'src/app/_services/avto.service';
import { AvtoStruct } from 'src/app/_classes/avto';

@Component({
  selector: 'app-dialog-create-avto',
  templateUrl: './dialog-create-avto.component.html',
})
export class DialogCreateAvtoComponent {
  constructor(
    private dialogRef: MatDialogRef<DialogCreateAvtoComponent>,
    private avtoService: AvtoService,
    @Inject(MAT_DIALOG_DATA) data: any,
  ) { }

  form: FormGroup = new FormGroup({
    name : new FormControl('', Validators.required),
    odo : new FormControl(null, [Validators.required, Validators.min(0), Validators.pattern(/[\d]+/)]),
  });

  submit() {
    const data: AvtoStruct = {
      name: this.form.get('name').value,
      odo: this.form.get('odo').value
    };
    this.avtoService.create(data).subscribe((avto: AvtoStruct) => {
      this.dialogRef.close(avto);
    });

    return false;
  }
}
