import { Component, OnInit, OnDestroy } from '@angular/core';
import { Avto, AvtoStruct } from 'src/app/_classes/avto';
import { MatDialog } from '@angular/material/dialog';
import { DialogCreateAvtoComponent } from '../dialog-create-avto/dialog-create-avto.component';
import { AvtoService } from 'src/app/_services/avto.service';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { DialogUpdateAvtoComponent } from '../dialog-update-avto/dialog-update-avto.component';
import { ReplaySubject, of } from 'rxjs';
import { takeUntil, mergeMap, map } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-list-avto',
  templateUrl: './list-avto.component.html',
  styleUrls: [
    '../../shared_styles/aside.scss',
    '../../shared_styles/aside_list.scss',
    './list-avto.component.scss'
  ],
})
export class ListAvtoComponent implements OnInit, OnDestroy {
  selectedAvto: Avto = null;
  avtoList: Avto[] = [];

  private destroy: ReplaySubject<boolean> = new ReplaySubject(1);

  constructor(
    private avtoService: AvtoService,
    private dialog: MatDialog,
  ) { }

  ngOnInit() {
    this.avtoService.selected.pipe(
      takeUntil(this.destroy)
    ).subscribe((avto: Avto) => {
      this.selectedAvto = avto;
    });

    this.fetchAvto();
  }

  ngOnDestroy() {
    this.destroy.next(null);
    this.destroy.complete();
    this.dialog.closeAll();
  }

  clickShowAddAvto(disableClose: boolean = false) {
    this.dialog.open(DialogCreateAvtoComponent, {
      autoFocus: false,
      disableClose: disableClose,
    }).afterClosed().subscribe((data: AvtoStruct) => {
      if (data) {
        const avto = new Avto(data);
        this.avtoList.push(avto);
        this.avtoService.setSelected(avto);
      }
    });
  }

  clickShowEditAvto() {
    const dialog = this.dialog.open(DialogUpdateAvtoComponent, {
      autoFocus: false,
      data: this.selectedAvto,
      width: '500px',
    });
    dialog.afterClosed().subscribe();
  }

  clickDeleteAvto() {
    this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: 'Удалить авто?',
        message: `Удалить ${this.selectedAvto.name} и всю историю по ней? Восстановление будет невозможным!`,
        type: 'warn'
      },
    }).afterClosed().pipe(
      mergeMap((ok: boolean) => {
        return ok ? this.avtoService.delete(this.selectedAvto.avto_id).pipe(map(() => true)) : of(false);
      })
    ).subscribe((ok: boolean) => {
      if (!ok) {
        return;
      }
      const index = this.avtoList.indexOf(this.selectedAvto);
      if (index !== -1) {
        this.avtoList.splice(index, 1);
        if (this.avtoList.length > 0) {
          this.avtoService.setSelected(this.avtoList[0]);
        } else {
          this.avtoService.setSelected(null);
        }
      }
    }, (err: HttpErrorResponse) => {
      // TODO
      // this.
    });
  }

  clickSelectAvto(avto: Avto, event: MouseEvent) {
    event.preventDefault();
    this.avtoService.setSelected(avto);
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
}
