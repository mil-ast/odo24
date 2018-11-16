import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MatSnackBar, MAT_DIALOG_DATA} from '@angular/material';
import { AvtoService } from '../../../_services/avto.service';
import { Avto } from '../../../_classes/avto';

@Component({
    selector: 'dialog-avto-create',
    templateUrl: './avto-create.component.html',
    styleUrls: ['./avto-create.component.css']
})
export class DialogAvtoCreateComponent {
    public formCreateAvto: FormGroup;

    constructor(
        private fb: FormBuilder,
        public snackBar: MatSnackBar,
        public dialogRef: MatDialogRef<DialogAvtoCreateComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private serviceAvto: AvtoService,
    ) {
		this.formCreateAvto = this.fb.group({
			name: ['', [Validators.required, Validators.minLength(2)]],
			odo: [null, [Validators.min(0)]],
		});
    }

    Submit() {
		this.formCreateAvto.disable();

        const data = {
            name : this.formCreateAvto.value.name,
            odo : this.formCreateAvto.value.odo,
        };
        
		const req = this.serviceAvto.Create(data);
		req.subscribe((res: any) => {
			const avto = new Avto(res.avto_id|0, res.name, res.odo, !!res.avatar);
			this.snackBar.open('Машина добавлена!', 'OK', {
				duration: 5000,
            });
            
            this.dialogRef.close(avto);
		}, (err) => {
			console.error(err);

			this.snackBar.open('Что-то пошло не так!', 'OK', {
				duration: 5000,
				panelClass : 'error',
            });
            
            this.formCreateAvto.enable();
		});
        return false;
    }
}
