import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Reminder } from '../../classes/reminder';
import { ReminderService } from '../../services/reminders.service';

import { MatDialog } from '@angular/material';

import { DialogReminderUpdateComponent } from '../../dialogs/reminder-update/reminder-update.component';

@Component({
	selector: 'app-item',
	templateUrl: './item.component.html',
	styleUrls: ['../../css/item.css','./item.component.css']
})
export class ItemComponent {
	@Input() model: Reminder;
	@Output() eventDelete: EventEmitter<Reminder> = new EventEmitter();

	constructor(
		public dialog: MatDialog,
		private reminderService: ReminderService,
	) {}

	ShowFormUpdate() {
        const dialogRef = this.dialog.open(DialogReminderUpdateComponent, {
            width: '400px',
            position: {
                top: '70px',
                left: '700px',
            },
            data: this.model
        });

        dialogRef.afterClosed().subscribe((result: Reminder) => {
            if (!result) {
                return;
            }
        });
		return false;
	}

	Delete() {
		if (!confirm('Удалить страховку?')) {
			return false;
		}

		const req = this.reminderService.Delete(this.model.id);
		req.subscribe(() => {
			this.eventDelete.emit(this.model);
			//this.snackBar.open('Изменения успешно сохранены!', 'OK', {duration: 5000});
		}, (err) => {
            console.error(err);
			//this.snackBar.open('Что-то пошло не так!', 'OK', {panelClass : 'error',});
		});
		
		return false;
	}
}
