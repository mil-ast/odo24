import { Component, OnInit, OnDestroy } from '@angular/core';
import { AvtoService } from '../_services/avto.service';
import { AvtoStruct } from '../_classes/avto';
import { Subscription } from 'rxjs';
import { GroupService, GroupStruct } from '../_services/groups.service';
import { ServiceService, ServiceStruct } from '../_services/service.service';
import { MatDialog } from '@angular/material';
import { finalize } from 'rxjs/operators';
import { ScreenpService, Screen, SmallScreen } from '../_services/screen.service';
import { DialogCreateServiceComponent } from './dialogs/dialog-create-service/dialog-create-service.component';

@Component({
  selector: 'app-services',
  templateUrl: './services.component.html',
  styleUrls: ['./services.component.scss', './services_screen.component.css']
})
export class ServicesComponent implements OnInit, OnDestroy {
  serviceList: ServiceStruct[] = [];
  selectedAvto: AvtoStruct = null;
  selectedGroup: GroupStruct = null;
  lastService: ServiceStruct = null;
  isSync = true;
  isSyncServices = true;
  screenIsSmall = false;

  private avtoListener: Subscription;
  private groupListener: Subscription;
  private screenListener: Subscription;
  private screenIsMobile = false;

  constructor(
    private avtoService: AvtoService,
    private groupService: GroupService,
    private serviceService: ServiceService,
    private dialog: MatDialog,
    private screenpService: ScreenpService
  ) { }

  ngOnInit() {
    this.isSyncServices = true;

    this.avtoListener = this.avtoService.selected.subscribe((avto: AvtoStruct) => {
      this.selectedAvto = avto;
      this.isSync = false;
    });
    this.groupListener = this.groupService.selected.subscribe((group: GroupStruct) => {
      this.selectedGroup = group;
      this.loadServices();
    });

    this.screenListener = this.screenpService.getScreen().subscribe(this.onResize.bind(this));
  }

  ngOnDestroy() {
    this.avtoListener.unsubscribe();
    this.groupListener.unsubscribe();
    this.screenListener.unsubscribe();
  }

  clickShowFormCreateService() {
    const config = { minWidth: '600px' };
    if (this.screenIsMobile) {
      config.minWidth = '98%';
    }

    const dialog = this.dialog.open(DialogCreateServiceComponent, config);
    dialog.afterClosed().subscribe((service: ServiceStruct) => {
      if (service) {
        this.serviceList.unshift(service);
      }
    });
  }

  onServiceDelete(service: ServiceStruct) {
    const index = this.serviceList.indexOf(service);
    if (index !== -1) {
      this.serviceList.splice(index, 1);
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

  private onResize(screen: Screen) {
    this.screenIsMobile = screen.innerWidth < 600;
    this.screenIsSmall = screen.innerWidth < SmallScreen;
  }
}
