import { Component, OnInit, OnDestroy } from '@angular/core';
import { AvtoStruct } from '../_classes/avto';
import { Subscription } from 'rxjs';
import { AvtoService } from '../_services/avto.service';
import { RemindingService, Reminding } from './services/reminding.service';
import { MatDialog } from '@angular/material';
import { DialogCreateDocComponent } from './dialogs/dialog-create-doc/dialog-create-doc.component';
import { ScreenService, Screen, SmallScreen } from '../_services/screen.service';

@Component({
  selector: 'app-reminding',
  templateUrl: './reminding.component.html',
  styleUrls: ['./reminding.component.scss'],
})
export class RemindingComponent implements OnInit, OnDestroy {
  remindList: Reminding[] = [];
  selectedAvto: AvtoStruct = null;
  screenIsMobile = false;
  screenIsSmall = false;

  private avtoListener: Subscription;
  private screenListener: Subscription;

  constructor(
    private avtoService: AvtoService,
    private remindingService: RemindingService,
    private dialog: MatDialog,
    private screenService: ScreenService,
  ) { }

  ngOnInit() {
    this.screenListener = this.screenService.getScreen().subscribe(this.onResize.bind(this));

    this.avtoListener = this.avtoService.selected.subscribe((avto: AvtoStruct) => {
      this.selectedAvto = avto;
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

  clickShowFormCreateDoct() {
    this.dialog.open(DialogCreateDocComponent, {
      data: this.selectedAvto
    }).afterClosed().subscribe((rem: Reminding) => {
      if (rem) {
        this.remindList.unshift(rem);
      }
    });
  }

  onDelete(rem: Reminding) {
    const index = this.remindList.indexOf(rem);
    if (index !== -1) {
      this.remindList.splice(index);
    }
  }

  private onResize(screen: Screen) {
    this.screenIsSmall = screen.innerWidth < SmallScreen;
    this.screenIsMobile = screen.innerWidth < 600;
  }
}
