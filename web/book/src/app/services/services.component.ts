import { Component, OnInit, OnDestroy } from '@angular/core';
import { AvtoService } from '../_services/avto.service';
import { AvtoStruct } from '../_classes/avto';
import { Subscription } from 'rxjs';
import { GroupService, GroupStruct } from '../_services/groups.service';
import { ServiceService, ServiceStruct } from '../_services/service.service';

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
  isSync = true;

  private avtoListener: Subscription;
  private groupListener: Subscription;

  constructor(
    private avtoService: AvtoService,
    private groupService: GroupService,
    private serviceService: ServiceService,
  ) { }

  ngOnInit() {
    this.avtoListener = this.avtoService.selected.subscribe((avto: AvtoStruct) => {
      this.selectedAvto = avto;
      this.loadServices();
    });
    this.groupListener = this.groupService.selected.subscribe((group: GroupStruct) => {
      this.selectedGroup = group;
      this.loadServices();
    });

    this.avtoService.get().subscribe((list: AvtoStruct[]) => {
      this.avtoList = list || [];
      if (list.length > 0) {
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

  private loadServices() {
    this.serviceList = [];
    if (!this.selectedAvto || !this.selectedGroup) {
      return;
    }

    this.serviceService.get(this.selectedAvto.avto_id, this.selectedGroup.group_id).subscribe((list: ServiceStruct[]) => {
      this.serviceList = list || [];
    });
  }
}
