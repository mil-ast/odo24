import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MatSnackBar, MAT_DIALOG_DATA} from '@angular/material';
import { ServicesService } from '../../services/services.service';
import { AvtoService } from '../../../_services/avto.service';
import { Service } from '../../classes/service';
import * as moment from 'moment';

@Component({
    selector: 'dialog-service-create',
    templateUrl: './service-create.component.html',
    styleUrls: ['./service-create.component.css']
})
export class DialogServiceCreateComponent {
    public formCreateService: FormGroup;

    constructor(
        private fb: FormBuilder,
        public snackBar: MatSnackBar,
        public dialogRef: MatDialogRef<DialogServiceCreateComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private serviceService: ServicesService,
        private avtoService: AvtoService,
    ) {
		this.formCreateService = this.fb.group({
			odo: [null, [Validators.required, Validators.min(0)]],
			next_odo: [null, Validators.min(0)],
			date: [null, Validators.required],
			comment: ['', Validators.maxLength(256)],
			price: null,
		});
    }

    Submit() {
        this.formCreateService.disable();

		let date = null;
		let m_date = moment(this.formCreateService.value.date);
		if (m_date.isValid()) {
			date = m_date.format('YYYY-MM-DD');
		}

		const values = {
			avto_id : this.data.selected_avto.avto_id,
			group_id : this.data.selected_group.group_id,
			odo : this.formCreateService.value.odo,
			date : date,
			comment : this.formCreateService.value.comment,
			price : this.formCreateService.value.price,
		};

		const req = this.serviceService.Create(values);
		req.subscribe((res: any) => {
			const service: Service = new Service(
				res.service_id,
				res.avto_id,
				res.odo,
				res.next_odo,
				res.date,
				res.comment,
				res.price,
			);

			const selectedAvto = this.avtoService.GetSelected();
			if (selectedAvto.odo < res.odo) {
				selectedAvto.odo = res.odo;
			}

			this.snackBar.open('Запись в журнал добавлена!', 'OK', {
				duration: 5000,
            });
            
            this.dialogRef.close(service);
		}, (err) => {
			console.error(err);

			this.snackBar.open('Что-то пошло не так!', 'OK', {
				duration: 5000,
				panelClass : 'error',
			});
		});
    }
}
