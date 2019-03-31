import { Component, OnInit, OnDestroy } from '@angular/core';
import { AvtoStruct } from '../_classes/avto';
import { Subscription } from 'rxjs';
import { AvtoService } from '../_services/avto.service';
import { RemindingService, Reminding } from './services/reminding.service';
import { MatDialog } from '@angular/material';
import { DialogCreateDocComponent } from './dialogs/dialog-create-doc/dialog-create-doc.component';
import { DialogCreateAvtoComponent } from '../app_components/dialog-create-avto/dialog-create-avto.component';

@Component({
  selector: 'app-reminding',
  templateUrl: './reminding.component.html',
  styleUrls: ['./reminding.component.css'],
})
export class RemindingComponent implements OnInit, OnDestroy {
  avtoList: AvtoStruct[] = [];
  remindList: Reminding[] = [];
  selectedAvto: AvtoStruct = null;
  private avtoListener: Subscription;

  constructor(
    private avtoService: AvtoService,
    private remindingService: RemindingService,
    private dialog: MatDialog,
  ) { }

  ngOnInit() {
    this.avtoListener = this.avtoService.selected.subscribe((avto: AvtoStruct) => {
      this.selectedAvto = avto;
    });

    this.avtoService.get().subscribe((list: AvtoStruct[]) => {
      this.avtoList = list || [];
      if (this.avtoList.length > 0) {
        this.avtoService.setSelected(list[0]);
      }

      this.fetch();
    });
  }

  ngOnDestroy() {
    this.avtoListener.unsubscribe();
  }

  fetch() {
    this.remindingService.get().subscribe((res: Reminding[]) => {
      this.remindList = res || [];
    });
  }

  clickShowFormCreateDoct(event: MouseEvent) {
    event.preventDefault();
    this.dialog.open(DialogCreateDocComponent, {
      width: '600px',
      data: this.selectedAvto
    }).afterClosed().subscribe((rem: Reminding) => {
      if (rem) {
        this.remindList.unshift(rem);
      }
    });
  }

  clickShowFormCreateAvto(event: MouseEvent) {
    event.preventDefault();
    this.dialog.open(DialogCreateAvtoComponent, {
      autoFocus: true,
      width: '500px',
    }).afterClosed().subscribe((avto: AvtoStruct) => {
      if (avto) {
        this.avtoList.push(avto);
        this.avtoService.setSelected(avto);
      }
    });
  }

  onDelete(rem: Reminding) {
    const index = this.remindList.indexOf(rem);
    if (index !== -1) {
      this.remindList.splice(index);
    }
  }
}
