import { Component, OnInit, OnDestroy} from '@angular/core';
import { AutoService } from '../_services/avto.service';
import { Auto } from '../_classes/auto';
import { ReplaySubject, combineLatest, zip, of } from 'rxjs';
import { GroupService, GroupStruct } from '../_services/groups.service';
import { ServiceService, ServiceStruct } from '../_services/service.service';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { finalize, takeUntil, filter, mergeMap } from 'rxjs/operators';
import { DialogCreateServiceComponent } from './dialogs/dialog-create-service/dialog-create-service.component';
import { AsideService } from '../_services/aside.service';
import { ToastrService } from 'ngx-toastr';
import { MatSelectChange } from '@angular/material';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';

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
  isSync = true;
  isLoading = true;
  isMobile = false;

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

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.groups, event.previousIndex, event.currentIndex);
  }

  ngOnInit() {
    this.autoService.selected.pipe(
      filter((selectedAvto: Auto) => selectedAvto !== null),
      mergeMap((selectedAvto: Auto) => {
        return this.groupService.get(selectedAvto.auto_id);
      }),
      takeUntil(this.destroy)
    ).subscribe((groups: GroupStruct[]) => {
      this.groups = groups || [];
    }, () => {
      this.toastr.error('Произошла ошибка!');
    });

    combineLatest(
      this.autoService.selected,
      this.groupService.selected
    ).pipe(
      takeUntil(this.destroy)
    ).subscribe(([auto, group]) => {
      if (!auto && !group) {
        return;
      }

      if (auto) {
        this.selectedAuto = auto;
      }

      if (group) {
        this.selectedGroup = group;
      }

      this.loadServices();
    });
  }

  ngOnDestroy() {
    this.dialog.closeAll();
    this.destroy.next();
    this.destroy.complete();

    this.serviceList = [];
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

  onServiceDelete(service: ServiceStruct) {
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

  get getLeftDistance(): number {
    /*if (this.selectedAvto && this.lastService && this.lastService.next_distance > 0) {
      const nextOdo = this.lastService.odo + this.lastService.next_distance;
      const leftOdo = nextOdo - this.selectedAvto.odo;

      if (leftOdo < 0) {
        return 0;
      }
      return leftOdo;
    }*/

    return 0;
  }

  get leftDistanceColorState(): number {
    /*if (!this.selectedAvto.odo || !this.lastService || !this.lastService.next_distance) {
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
    }*/

    return 0;
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
      this.serviceList = list || [];
    });
  }
}
