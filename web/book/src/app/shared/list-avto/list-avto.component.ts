import { Component, OnInit, OnDestroy } from '@angular/core';
import { Avto, AvtoStruct } from 'src/app/_classes/avto';
import { MatDialog } from '@angular/material/dialog';
import { DialogCreateAvtoComponent } from '../dialog-create-avto/dialog-create-avto.component';
import { AvtoService } from 'src/app/_services/avto.service';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { DialogUpdateAvtoComponent } from '../dialog-update-avto/dialog-update-avto.component';
import { ScreenService, Screen, SmallScreen } from 'src/app/_services/screen.service';
import { ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-list-avto',
  templateUrl: './list-avto.component.html',
})
export class ListAvtoComponent implements OnInit, OnDestroy {
  selectedAvto: Avto = null;
  avtoList: Avto[] = [];

  private smallScreen = false;
  private destroy: ReplaySubject<boolean> = new ReplaySubject(1);

  constructor(
    private avtoService: AvtoService,
    private screenService: ScreenService,
    private dialog: MatDialog,
  ) { }

  ngOnInit() {
    this.avtoService.selected.pipe(
      takeUntil(this.destroy)
    ).subscribe((avto: Avto) => {
      this.selectedAvto = avto;
    });

    this.screenService.getScreen().pipe(
      takeUntil(this.destroy)
    ).subscribe(this.configureSideNav.bind(this));
    this.fetchAvto();
  }

  ngOnDestroy() {
    this.destroy.next(null);
    this.destroy.complete();
  }

  clickShowAddAvto(disableClose: boolean = false) {
    const dialog = this.dialog.open(DialogCreateAvtoComponent, {
      autoFocus: false,
      disableClose: disableClose,
    });
    dialog.afterClosed().subscribe((data: AvtoStruct) => {
      if (data) {
        const avto = new Avto(data);
        this.avtoList.push(avto);
        this.avtoService.setSelected(avto);
      }
    });
  }

  clickShowEditAvto(avto: AvtoStruct) {
    let position = null;
    if (!this.smallScreen) {
      position = '40px';
    }
    const dialog = this.dialog.open(DialogUpdateAvtoComponent, {
      autoFocus: false,
      data: avto,
      width: '500px',
      position: {
        left: position,
      }
    });
    dialog.afterClosed().subscribe();
  }

  clickDeleteAvto(avto: Avto) {
    const dialog = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: 'Удалить авто?',
        message: 'Удалить авто и всю историю по ней? Восстановление будет невозможным!',
        type: 'warn'
      },
    });
    dialog.afterClosed().subscribe((ok: boolean) => {
      if (!ok) {
        return;
      }

      this.avtoService.delete(avto.avto_id).subscribe(() => {
        this.onAvtoDelete(avto);
      });
    });
  }

  // евент удаления авто
  onAvtoDelete(avto: Avto) {
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

  private fetchAvto() {
    this.avtoService.getAvto().subscribe((list: Avto[]) => {
      this.avtoList = list || [];
      if (this.avtoList.length > 0) {
        this.avtoService.setSelected(list[0]);
      } else {
        this.clickShowAddAvto(true);
      }
    });
  }

  private configureSideNav(screen: Screen) {
    this.smallScreen = screen.innerWidth < SmallScreen ? true : false;
  }
}
