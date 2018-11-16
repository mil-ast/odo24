import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MatSnackBar, MAT_DIALOG_DATA} from '@angular/material';
import { ServicesService } from '../../services/services.service';
import { Service } from '../../classes/service';
import * as moment from 'moment';

@Component({
    selector: 'dialog-service-update',
    templateUrl: './service-update.component.html',
    styleUrls: ['./service-update.component.css']
})
export class DialogServiceUpdateComponent {
    public formUpdateService: FormGroup;

    constructor(
        private fb: FormBuilder,
        public snackBar: MatSnackBar,
        public dialogRef: MatDialogRef<DialogServiceUpdateComponent>,
        @Inject(MAT_DIALOG_DATA) public data: Service,
        private serviceService: ServicesService,
    ) {
		this.formUpdateService = this.fb.group({
			odo: [data.odo, [Validators.required, Validators.min(0)]],
			next_odo: [data.next_odo, Validators.min(0)],
			date: [data.date, Validators.required],
			comment: [data.comment, Validators.maxLength(256)],
			price: data.price,
		});
    }

    Submit() {
        this.formUpdateService.disable();

		let date = null;
		let m_date = moment(this.formUpdateService.value.date);
		if (m_date.isValid()) {
			date = m_date.format('YYYY-MM-DD');
		}

		const values = {
			service_id : this.data.service_id,
			odo : this.formUpdateService.value.odo,
			date : date,
			comment : this.formUpdateService.value.comment,
			price : this.formUpdateService.value.price,
		};

		const req = this.serviceService.Update(values);
		req.subscribe((res: any) => {
			this.data.Update(res.odo, res.next_odo, res.date, res.comment, res.price);

			this.snackBar.open('Изменения успешно сохранены!', 'OK', {
				duration: 5000,
            });
            
            this.dialogRef.close(this.data);
		}, (err) => {
			console.error(err);

			this.snackBar.open('Что-то пошло не так!', 'OK', {
				duration: 5000,
				panelClass : 'error',
			});
		});
    }
}
