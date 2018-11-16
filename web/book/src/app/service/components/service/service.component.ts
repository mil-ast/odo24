import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { MatDialog, MatSnackBar } from '@angular/material';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { ServicesService } from '../../services/services.service';
import { Service } from '../../classes/service';

// диалог
import { DialogServiceUpdateComponent } from '../../dialogs/service-update/service-update.component';

import * as moment from 'moment';

@Component({
  selector: 'app-service',
  templateUrl: './service.component.html',
  styleUrls: ['../../../_css/list_styles.css', './service.component.css'],
})
export class ServiceComponent implements OnInit {
	@Input() model: Service;
	@Input() prev_odo: number;
	@Output() eventDeleteService: EventEmitter<Service> = new EventEmitter();

	public formUpdateService: FormGroup;

	constructor(
		private fb: FormBuilder,
		public dialog: MatDialog,
		public snackBar: MatSnackBar,
		private servicesService: ServicesService,
	) {
		this.formUpdateService = this.fb.group({
			odo: [null, [Validators.required, Validators.min(0)]],
			next_odo: [null, Validators.min(0)],
			date: [null, Validators.required],
			comment: ['', Validators.maxLength(256)],
			price: null,
		});
	}

	ngOnInit() {
		let date = null;
		if (this.model.date) {
			date = moment(this.model.date);
		}

		this.formUpdateService.patchValue({
			odo : this.model.odo,
			next_odo : this.model.next_odo,
			date : date,
			comment : this.model.comment,
			price : this.model.price,
		});
	}

	/* показать форму редактирования */
	ShowFormUpdate() {
        const dialogRef = this.dialog.open(DialogServiceUpdateComponent, {
            width: '600px',
            position: {
                top: '140px',
                right: '20px',
            },
            data: this.model
        });

        dialogRef.afterClosed().subscribe((service: Service) => {});
		
		return false;
	}

	/* удаление сервиса */
	DeleteService() {
		if (!confirm('Удалить запись?')) {
			return false;
		}
		const req = this.servicesService.Delete(this.model.service_id);
		req.subscribe(() => {
			this.eventDeleteService.emit(this.model);

			this.snackBar.open('Удалено!', 'OK', {
				duration: 5000,
			});
		}, (err) => {
			console.error(err);

			this.snackBar.open('Что-то пошло не так!', 'OK', {
				duration: 5000,
				panelClass : 'error',
			});
		});

		return false;
	}
}
