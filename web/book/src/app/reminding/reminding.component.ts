import { Component, OnInit, OnDestroy } from '@angular/core';
import { AvtoStruct } from '../_classes/avto';
import { Subscription } from 'rxjs';
import { AvtoService } from '../_services/avto.service';
import { RemindingService, Reminding } from './services/reminding.service';
import { MatDialog } from '@angular/material';
import { DialogCreateDocComponent } from './dialogs/dialog-create-doc/dialog-create-doc.component';

@Component({
  selector: 'app-reminding',
  templateUrl: './reminding.component.html',
  styleUrls: ['./reminding.component.css'],
  providers: [
    RemindingService,
  ]
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
    const dialog = this.dialog.open(DialogCreateDocComponent, {
      width: '600px',
    });

  }
}
