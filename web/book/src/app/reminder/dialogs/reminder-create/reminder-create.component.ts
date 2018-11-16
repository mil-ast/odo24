import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MatSnackBar, MAT_DIALOG_DATA} from '@angular/material';
import { ReminderService } from '../../services/reminders.service';
import { Reminder } from '../../classes/reminder';

@Component({
    selector: 'dialog-reminder-create',
    templateUrl: './reminder-create.component.html',
    styleUrls: ['./reminder-create.component.css']
})
export class DialogReminderCreateComponent {
    public form: FormGroup;

    constructor(
        private fb: FormBuilder,
        public snackBar: MatSnackBar,
        public dialogRef: MatDialogRef<DialogReminderCreateComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private reminderService: ReminderService,
    ) {
		this.form = this.fb.group({
			date_start:[null, Validators.required],
            date_end: [null, Validators.required],
            event_before : [30, Validators.required],
            comment: ['', Validators.maxLength(256)],
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
            date_start : date_start,
            date_end : date_end,
            comment : this.form.value.comment,
            event_before : this.form.value.event_before,
            event_type : this.data.event_type,
        };

        const req = this.reminderService.Create(values);
        req.subscribe((res: any) => {
            const rem = new Reminder(res.id, res.date_start, res.date_end, res.event_before, res.comment);

			this.snackBar.open('Страховка добавлена!', 'OK', {
				duration: 5000,
            });
            
            this.dialogRef.close(rem);
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
