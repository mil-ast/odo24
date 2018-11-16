import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MatSnackBar, MAT_DIALOG_DATA} from '@angular/material';
import { ReminderService } from '../../services/reminders.service';
import { Reminder } from '../../classes/reminder';
import * as moment from 'moment';

@Component({
    selector: 'dialog-reminder-update',
    templateUrl: './reminder-update.component.html',
    styleUrls: ['./reminder-update.component.css']
})
export class DialogReminderUpdateComponent implements OnInit {
    public form: FormGroup;

    constructor(
        private fb: FormBuilder,
        public snackBar: MatSnackBar,
        public dialogRef: MatDialogRef<DialogReminderUpdateComponent>,
        @Inject(MAT_DIALOG_DATA) public data: Reminder,
        private reminderService: ReminderService,
    ) {
		this.form = this.fb.group({
			date_start:[null, Validators.required],
            date_end: [null, Validators.required],
            event_before : [30, Validators.required],
            comment: ['', Validators.maxLength(256)],
        });
    }

    ngOnInit() {
		let date_start = null;
		if (this.data.date_start) {
			date_start = moment(this.data.date_start);
		}
		let date_end = null;
		if (this.data.date_end) {
			date_end = moment(this.data.date_end);
        }

		this.form.patchValue({
			date_start : date_start,
			date_end : date_end,
			event_before : this.data.event_before,
			comment : this.data.comment,
		});
    }

    Submit() {
		this.form.disable();

        let date_start = null;
        if (this.form.value.date_start) {
            date_start = this.form.value.date_start.format('YYYY-MM-DD');
        }
        
        let date_end = null;
        if (this.form.value.date_end) {
            date_end = this.form.value.date_end.format('YYYY-MM-DD');
        }

        const values = {
            id : this.data.id,
            date_start : date_start,
            date_end : date_end,
            event_before : this.form.value.event_before,
            comment : this.form.value.comment,
        };

        const req = this.reminderService.Update(values);
        req.subscribe((res: any) => {
            this.data.Update(res.date_start, res.date_end, res.event_before, res.comment);
            
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
        
        return false;
    }
}
