import { Component, OnInit, OnDestroy, ViewChild} from '@angular/core';
import { AutoService } from '../_services/avto.service';
import { Auto } from '../_classes/auto';
import { ReplaySubject, combineLatest } from 'rxjs';
import { GroupService, GroupStruct } from '../_services/groups.service';
import { ServiceService, ServiceStruct } from './services/service.service';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { finalize, takeUntil } from 'rxjs/operators';
import { DialogCreateServiceComponent } from './dialogs/dialog-create-service/dialog-create-service.component';
import { AsideService } from '../_services/aside.service';
import { ToastrService } from 'ngx-toastr';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
import { DialogConfigGroupsComponent } from './dialogs/dialog-config-groups/dialog-config-groups.component';
import { MatSidenav } from '@angular/material/sidenav';
import { MatSelectChange } from '@angular/material/select'

@Component({
  selector: 'app-services',
  templateUrl: './services.component.html',
  styleUrls: ['./services.component.scss']
})
export class ServicesComponent implements OnInit, OnDestroy {
  groups: GroupStruct[] = [];
  serviceList: ServiceStruct[] = [];
  selectedAuto: Auto;
  selectedGroup: GroupStruct = {
    group_id: null,
    group_name: null,
    sort: null,
  };
  lastService: ServiceStruct = null;
  isLoading = false;
  isMobile = false;

  @ViewChild('snav', {static: true}) private sidenav: MatSidenav;

  private destroy: ReplaySubject<boolean> = new ReplaySubject(1);

  constructor(
    private asideService: AsideService,
    private autoService: AutoService,
    private groupService: GroupService,
    private serviceService: ServiceService,
    private dialog: MatDialog,
    private toastr: ToastrService,
  ) {
    this.isMobile = this.asideService.isMobile();
  }

  ngOnInit() {
    this.asideService.setSidenav(this.sidenav);

    this.groupService.get().subscribe((groups: GroupStruct[]) => {
      this.groups = groups || [];
    }, (err) => {
      console.error(err);
      this.toastr.error('Не удалось получить список групп');
    });

    combineLatest(
      this.autoService.selected,
      this.groupService.selected
    ).pipe(
      takeUntil(this.destroy)
    ).subscribe(([auto, group]) => {
      if (auto) {
        this.selectedAuto = auto;
      }

      if (group) {
        this.selectedGroup = group;
      }

      if (auto !== null && group !== null) {
        this.loadServices();
      }
    });
  }

  ngOnDestroy() {
    this.dialog.closeAll();
    this.destroy.next();
    this.destroy.complete();

    this.selectedAuto = null;
    this.selectedGroup = null;
    this.serviceList = [];

    this.asideService.setSidenav(null);
  }
  
  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.groups, event.previousIndex, event.currentIndex);
  }

  clickShowFormCreateService() {
    const config: MatDialogConfig = {
      minWidth: '600px',
      autoFocus: false,
      data: {
        auto_id: this.selectedAuto.auto_id,
        group_id: this.selectedGroup.group_id,
        odo: this.selectedAuto.odo,
      }
    };
    if (this.isMobile) {
      config.minWidth = '98%';
      config.position = {
        top: '1%'
      };
    }

    const dialog = this.dialog.open(DialogCreateServiceComponent, config);
    dialog.afterClosed().subscribe((service: ServiceStruct) => {
      if (service) {
        this.serviceList.unshift(service);

        this.serviceList = this.serviceService.sort(this.serviceList);
        this.lastService = this.serviceService.getLastSorted(this.serviceList);
      }
    });
  }

  toggleGroupConfig() {
    this.dialog.open(DialogConfigGroupsComponent, {
      data: this.groups,
      backdropClass: 'transparent',
    });
  }

  onDeleteService(service: ServiceStruct) {
    const index = this.serviceList.indexOf(service);
    if (index !== -1) {
      this.serviceList.splice(index, 1);
      this.lastService = this.serviceService.getLastSorted(this.serviceList);
    }
  }

  onGroupChange(select: MatSelectChange) {
    const selectedGroup = this.groups.find((g: GroupStruct) => g.group_id === select.value);
    if (selectedGroup) {
      this.groupService.setSelected(selectedGroup);
    }
  }

  private loadServices() {
    const selectedAutoID = this.selectedAuto.auto_id;
    const selectedGroupID = this.selectedGroup.group_id;

    if (!selectedAutoID || !selectedGroupID) {
      return;
    }
    this.serviceList = [];
    this.lastService = null;

    this.isLoading = true;
    this.serviceService.get(selectedAutoID, selectedGroupID).pipe(
      finalize(() => { this.isLoading = false; }),
      takeUntil(this.destroy)
    ).subscribe((list: ServiceStruct[]) => {
      this.serviceList = this.serviceService.sort(list || [])
      this.lastService = this.serviceService.getLastSorted(this.serviceList);
    });
  }
}
