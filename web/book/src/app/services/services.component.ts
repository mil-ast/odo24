import { Component, OnInit, OnDestroy } from '@angular/core';
import { AvtoService } from '../_services/avto.service';
import { AvtoStruct } from '../_classes/avto';
import { Subscription } from 'rxjs';
import { GroupService, GroupStruct, GroupsStats } from '../_services/groups.service';
import { ServiceService, ServiceStruct } from '../_services/service.service';
import { MatDialog } from '@angular/material';
import { DialogCreateAvtoComponent } from './dialogs/dialog-create-avto/dialog-create-avto.component';
import { DialogCreateGroupComponent } from './dialogs/dialog-create-group/dialog-create-group.component';
import { DialogCreateServiceComponent } from './dialogs/dialog-create-service/dialog-create-service.component';
import { map, finalize } from 'rxjs/operators';

@Component({
  selector: 'app-services',
  templateUrl: './services.component.html',
  styleUrls: ['./services.component.css']
})
export class ServicesComponent implements OnInit, OnDestroy {
  avtoList: AvtoStruct[] = [];
  groupList: GroupStruct[] = [];
  serviceList: ServiceStruct[] = [];

  selectedAvto: AvtoStruct = null;
  selectedGroup: GroupStruct = null;
  lastService: ServiceStruct = null;
  isSync = true;
  isSyncServices = true;

  private avtoListener: Subscription;
  private groupListener: Subscription;

  constructor(
    private avtoService: AvtoService,
    private groupService: GroupService,
    private serviceService: ServiceService,
    private dialog: MatDialog,
  ) { }

  ngOnInit() {
    this.isSyncServices = true;

    this.avtoListener = this.avtoService.selected.subscribe((avto: AvtoStruct) => {
      this.selectedAvto = avto;
      this.syncGroupStats();
      this.loadServices();
    });
    this.groupListener = this.groupService.selected.subscribe((group: GroupStruct) => {
      this.selectedGroup = group;
      this.loadServices();
    });

    this.avtoService.get().subscribe((list: AvtoStruct[]) => {
      this.avtoList = list || [];
      if (this.avtoList.length > 0) {
        this.avtoService.setSelected(list[0]);
      }

      this.isSync = false;
    });

    this.groupService.get().subscribe((list: GroupStruct[]) => {
      this.groupList = list || [];
      if (this.groupList.length > 0) {
        this.groupService.setSelected(this.groupList[0]);
      }
    });
  }

  ngOnDestroy() {
    this.avtoListener.unsubscribe();
    this.groupListener.unsubscribe();
  }

  clickShowFormCreateAvto(event: MouseEvent) {
    event.preventDefault();
    const dialog = this.dialog.open(DialogCreateAvtoComponent, {
      autoFocus: true,
      width: '500px',
    });

    dialog.afterClosed().subscribe((avto: AvtoStruct) => {
      if (avto) {
        this.avtoList.push(avto);
        this.avtoService.setSelected(avto);
      }
    });
  }

  clickShowFormCreateGroup(event: MouseEvent) {
    event.preventDefault();
    const dialog = this.dialog.open(DialogCreateGroupComponent, {
      width: '500px',
    });

    dialog.afterClosed().subscribe((group: GroupStruct) => {
      if (group) {
        this.groupList.push(group);
        this.groupService.setSelected(group);
      }
    });
  }

  clickShowFormCreateService(event: MouseEvent) {
    event.preventDefault();
    const dialog = this.dialog.open(DialogCreateServiceComponent, {
      width: '600px',
    });

    dialog.afterClosed().subscribe((service: ServiceStruct) => {
      if (service) {
        this.serviceList.unshift(service);
        this.incrementGroupCnt(service.group_id);
      }
    });
  }

  onAvtoDelete(avto: AvtoStruct) {
    const index = this.avtoList.indexOf(avto);
    if (index !== -1) {
      this.avtoList.splice(index, 1);
      if (this.avtoList.length > 0) {
        this.avtoService.setSelected(this.avtoList[0]);
      } else {
        this.avtoService.setSelected(null);
      }
    }
  }

  onGroupDelete(group: GroupStruct) {
    const index = this.groupList.indexOf(group);
    if (index !== -1) {
      this.groupList.splice(index, 1);
      if (this.groupList.length > 0) {
        this.groupService.setSelected(this.groupList[0]);
      } else {
        this.groupService.setSelected(null);
      }
    }
  }

  onServiceDelete(service: ServiceStruct) {
    const index = this.serviceList.indexOf(service);
    if (index !== -1) {
      this.serviceList.splice(index, 1);
      this.decrementGroupCnt(service.group_id);
    }
  }

  get getLeftDistance(): number {
    if (this.selectedAvto && this.lastService && this.lastService.next_distance > 0) {
      const nextOdo = this.lastService.odo + this.lastService.next_distance;
      const leftOdo = nextOdo - this.selectedAvto.odo;

      if (leftOdo < 0) {
        return 0;
      }

      return leftOdo;
    }

    return 0;
  }

  get leftDistanceColorState(): number {
    if (!this.selectedAvto.odo || !this.lastService || !this.lastService.next_distance) {
      return 0;
    }

    const nextOdo = this.lastService.odo + this.lastService.next_distance;
    const leftDistance = nextOdo - this.selectedAvto.odo;
    if (leftDistance < 0) {
      return 3; // err
    }

    const percent = (100 / this.lastService.next_distance) * (this.selectedAvto.odo - this.lastService.odo);
    if (percent > 89.9) {
      return 3; // err
    } else if (percent > 69.9) {
      return 2; // warn2
    } else if (59.9) {
      return 1; // warn1
    }

    return 0;
  }

  private resetGroupStates() {
    this.groupList.forEach((group: GroupStruct) => {
      group.cnt = null;
    });
  }

  private syncGroupStats() {
    if (!this.selectedAvto) {
      return;
    }

    this.resetGroupStates();

    this.groupService.getStats(this.selectedAvto.avto_id).pipe(
      map((stats: GroupsStats[]) => {
        const links = new Map();
        stats = stats || [];
        stats.forEach((row: GroupsStats) => {
          links.set(row.group_id, row.cnt);
        });
        return links;
      })
    ).subscribe((stats: Map<number, number>) => {
      this.groupList.forEach((group: GroupStruct) => {
        group.cnt = stats.get(group.group_id) | 0;
      });
    });
  }

  private loadServices() {
    this.serviceList = [];
    this.lastService = null;
    if (!this.selectedAvto || !this.selectedGroup) {
      return;
    }

    this.isSyncServices = true;
    this.serviceService.get(this.selectedAvto.avto_id, this.selectedGroup.group_id).pipe(
      finalize(() => {
        this.isSyncServices = false;
      })
    ).subscribe((list: ServiceStruct[]) => {
      this.serviceList = list || [];

      if (list.length > 0) {
        this.lastService = list[0];
      }
    });
  }

  private incrementGroupCnt(group_id: number) {
    const group = this.findGroupById(group_id);
    if (group) {
      group.cnt++;
    }
  }

  private decrementGroupCnt(group_id: number) {
    const group = this.findGroupById(group_id);
    if (group) {
      group.cnt--;
    }
  }
  private findGroupById(group_id: number): GroupStruct | undefined {
    return this.groupList.find((g: GroupStruct) => {
      return g.group_id === group_id;
    });
  }
}
