import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, forkJoin } from 'rxjs';
import { MatDialog } from '@angular/material';
import { AvtoService } from '../../../_services/avto.service';
import { ReminderService } from '../../services/reminders.service';
import { Avto } from '../../../_classes/avto';
import { Reminder } from '../../classes/reminder';
import { DialogReminderCreateComponent } from '../../dialogs/reminder-create/reminder-create.component';

@Component({
	selector: 'app-main',
	templateUrl: './main.component.html',
	styleUrls: [
		'../../../_css/list_avto.css',
		'../../../_css/columns.css',
        '../../css/list.css',
		'./main.component.css'
	]
})
export class MainComponent implements OnInit {
	avto: Avto[] = [];
	insurance: Reminder[] = [];
	drivers_license: Reminder[] = [];

	selected_avto: Avto = null;
	isSync: boolean = true;

	constructor(
		public dialog: MatDialog,
		private router: Router,
		private avtoService: AvtoService,
		private reminderService: ReminderService,
	) { }

	ngOnInit() {
		forkJoin(
			this.avtoService.Get(),
			this.reminderService.Get()
		).subscribe((res: any[]) => {
			this.isSync = false;

			const avto = res[0]||[];
			const reminders = res[1]||[];

			if (avto.length === 0) {
				this.router.navigate(['/service']);
				return;
			}

			let selected_vato_id: number = 0;
			const storage_avto_id: string = localStorage.getItem('avto_id');
			if (storage_avto_id !== null) {
				selected_vato_id = parseInt(storage_avto_id)|0;
			}

			for (let i = 0; i < avto.length; i++) {
				const item_avto: Avto = new Avto(avto[i].avto_id, avto[i].name, avto[i].odo, !!avto[i].avatar)
				
				if (item_avto.avto_id === selected_vato_id) {
					this.selected_avto = this.avtoService.SetSelected(item_avto);
				}

				this.avto.push(item_avto);
			}

			if (selected_vato_id === 0) {
				this.selected_avto = this.avtoService.SetSelected(this.avto[0]);
			}

			// обход напоминаний
			for (let i = 0; i < reminders.length; i++) {
				const rem = new Reminder(reminders[i].id, reminders[i].date_start, reminders[i].date_end, reminders[i].event_before, reminders[i].comment);
				
				switch(reminders[i].event_type) {
				case 'docs':
					this.drivers_license.push(rem);
				break;
				default:
					this.insurance.push(rem);
				}
			}
		});
	}

    ShowFormCreate(event_type: string) {
        const dialogRef = this.dialog.open(DialogReminderCreateComponent, {
            width: '400px',
            position: {
                top: '70px',
                left: event_type === 'docs' ? '700px' : '300px',
            },
            data: {
                event_type : event_type
            }
        });

        dialogRef.afterClosed().subscribe((result: Reminder) => {
            if (!result) {
                return;
			}
			
			if (event_type === 'docs') {
				this.drivers_license.unshift(result);
			} else {
				this.insurance.unshift(result);
			}
        });

		return false;
    }

	ClickSelectAvto(avto: Avto) {
		if (avto === null) {
			localStorage.removeItem('avto_id');
			
			this.selected_avto = null;
			this.avtoService.ResetSelected();
		} else {
			this.selected_avto = this.avtoService.SetSelected(avto);
			localStorage.setItem('avto_id', avto.avto_id.toString());
		}
		
		return false;
	}
}
