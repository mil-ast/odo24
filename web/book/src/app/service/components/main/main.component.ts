import { Component, OnInit } from '@angular/core';
import { MatDialog, MatSnackBar } from '@angular/material';
import { Observable } from 'rxjs/Rx';

import { AvtoService } from '../../../_services/avto.service';
import { GroupsService } from '../../services/groups.service';
import { ServicesService } from '../../services/services.service';

import { Avto } from '../../../_classes/avto';
import { Group } from '../../classes/group';
import { Service } from '../../classes/service';

// диалоги
import { DialogAvtoCreateComponent } from '../../dialogs/avto-create/avto-create.component';
import { DialogGroupCreateComponent } from '../../dialogs/group-create/group-create.component';
import { DialogServiceCreateComponent } from '../../dialogs/service-create/service-create.component';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: [
	  '../../../_css/list_avto.css',
	  '../../../_css/columns.css',
	  './main.component.css'
	],
})
export class MainComponent implements OnInit {
	avto: Avto[] = [];
	groups: Group[] = [];
	selected_avto: Avto = null;
	selected_group: Group = null;

	isSync: boolean = true;

	constructor(
		public dialog: MatDialog,
		public snackBar: MatSnackBar,
		private avtoService: AvtoService,
		private groupsService: GroupsService,
		private servicesService: ServicesService,
	) { }

	ngOnInit() {
		Observable.forkJoin(
			this.avtoService.Get(),
			this.groupsService.Get(),
			this.servicesService.Get()
		).subscribe((res: any) => {
			this.isSync = false;

			const avto = res[0]||[];
			const groups = res[1]||[];
			const services = res[2]||[];

			var selected_vato_id: number = 0;
			const storage_avto_id: string = localStorage.getItem('avto_id');
			if (storage_avto_id !== null) {
				selected_vato_id = parseInt(storage_avto_id)|0;
			}

			if (avto.length === 0) {
				// показать форму добавления авто
				this.ShowFormCreateAvto();
			} else {
				for (let i = 0; i < avto.length; i++) {
					const item_avto: Avto = new Avto(avto[i].avto_id, avto[i].name, avto[i].odo, !!avto[i].avatar)

					if (item_avto.avto_id === selected_vato_id) {
						this.selectAvto(item_avto);
					}

					this.avto.push(item_avto);
				}

				if (!this.selected_avto) {
					this.selectAvto(this.avto[0]);
				}
			}

			// группируем сервисы
			var services_groups: Map<number, Service[]> = new Map();
			for (let i = 0; i < services.length; i++) {
				const service: Service = new Service(
					services[i].service_id,
					services[i].avto_id,
					services[i].odo,
					services[i].next_odo,
					services[i].date,
					services[i].comment,
					services[i].price,
				);

				if (!services_groups.has(services[i].group_id)) {
					services_groups.set(services[i].group_id, [ service ]);
				} else {
					services_groups.get(services[i].group_id).push(service);
				}
			}

			for (let i = 0; i < groups.length; i++) {
				this.groups.push(new Group(groups[i].group_id, groups[i].name, groups[i].own, services_groups.get(groups[i].group_id)));
			}

			if (this.groups.length > 0) {
				this.selected_group = this.groups[0];
			}
		});
	}

	/*
	клик выбора одной группы в списке
	*/
	ClickSelectGroup(group: Group = null) {
		if (group === null) {
			this.selected_group = null;
		} else {
			this.selected_group = group;
		}
	}

	ClickSelectAvto(avto: Avto) {
		if (avto === null) {
			this.selected_avto = null;
			this.avtoService.ResetSelected();
			
			localStorage.removeItem('avto_id');
		} else {
			this.selectAvto(avto);
		}
		
		return false;
	}

	ShowFormCreateAvto() {
        const dialogRef = this.dialog.open(DialogAvtoCreateComponent, {
            width: '400px',
            position: {
                top: '70px',
                left: '20px',
            },
            data: {}
        });

        dialogRef.afterClosed().subscribe((avto: Avto) => {
            if (!avto) {
                return;
			}
			
			this.avto.unshift(avto);
			// если первый авто, выберем его
			if (this.avto.length == 1) {
				this.selectAvto(avto);
			}
        });

		return false;
	}
	
	ShowFormCreateGroup() {
        const dialogRef = this.dialog.open(DialogGroupCreateComponent, {
            width: '400px',
            position: {
                top: '70px',
                left: '320px',
            },
            data: {}
        });

        dialogRef.afterClosed().subscribe((result: Group) => {
            if (!result) {
                return;
			}
			
			this.groups.push(result);
        });

		return false;
	}

	/* скрыть/показать форму добавления сервиса */
	ShowFormCreateService() {
        const dialogRef = this.dialog.open(DialogServiceCreateComponent, {
            width: '600px',
            position: {
                top: '70px',
                left: '620px',
            },
            data: {
				selected_avto : this.selected_avto,
				selected_group : this.selected_group,
			}
        });

        dialogRef.afterClosed().subscribe((service: Service) => {
            if (!service) {
                return;
			}

			this.selected_group.services.unshift(service);
        });

		return false;
	}

	/* удаление авто */
	RemoveAvto(avto: Avto) {
		const index = this.avto.indexOf(avto);
		if (index !== -1) {
			this.avto.splice(index, 1);
		}

		if (this.avto.length > 0) {
			if (this.selected_avto == avto) {
				this.selectAvto(this.avto[0]);
			}
		} else {
			if (this.selected_avto == avto) {
				this.selected_avto = null;
				this.selected_group = this.groups[0];
			}
		}
	}
	/* удаление группы */
	RemoveGroup(group: Group) {
		const index = this.groups.indexOf(group);
		if (index !== -1) {
			this.groups[index].services = [];
			this.groups.splice(index, 1);

			if (this.selected_group == group) {
				this.selected_group = this.groups[0];
			}
		}
	}
	/* удаление сервиса */
	RemoveService(service: Service) {
		const index = this.selected_group.services.indexOf(service);
		if (index !== -1) {
			this.selected_group.services.splice(index, 1);
		}
	}

	private selectAvto(avto: Avto) {
		this.selected_avto = this.avtoService.SetSelected(avto);
		localStorage.setItem('avto_id', avto.avto_id.toString());
	}
}
