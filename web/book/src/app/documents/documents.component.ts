import { Component, OnInit, OnDestroy } from '@angular/core';
import { AutoStruct } from '../_classes/auto';
import { Subscription } from 'rxjs';
import { AutoService } from '../_services/avto.service';
import { DocumentsService, Document } from './services/documents.service';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { DialogCreateDocComponent } from './dialogs/dialog-create-doc/dialog-create-doc.component';
import { ScreenService, Screen, SmallScreen } from '../_services/screen.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-documents',
  templateUrl: './documents.component.html',
  styleUrls: ['./documents.component.scss'],
})
export class DocumentsComponent implements OnInit, OnDestroy {
  remindList: Document[] = [];
  selectedAvto: AutoStruct = null;
  screenIsMobile = false;
  screenIsSmall = false;
  isSync = true;
  isloading = false;

  private avtoListener: Subscription;
  private screenListener: Subscription;

  constructor(
    private avtoService: AutoService,
    private remindingService: DocumentsService,
    private dialog: MatDialog,
    private screenService: ScreenService,
  ) { }

  ngOnInit() {
    this.screenListener = this.screenService.getScreen().subscribe(this.onResize.bind(this));

    this.avtoListener = this.avtoService.selected.subscribe((avto: AutoStruct) => {
      this.isSync = false;
      this.selectedAvto = avto;
      this.fetch();
    });
  }

  ngOnDestroy() {
    this.avtoListener.unsubscribe();
  }

  fetch() {
    this.isloading = true;
    this.remindingService.get().pipe(
      finalize(() => {
        this.isloading = false;
      })
    ).subscribe((res: Document[]) => {
      this.remindList = res || [];
    });
  }

  clickShowFormCreateDoct() {
    const config: MatDialogConfig = {
      minWidth: '600px',
      autoFocus: false,
      data: this.selectedAvto,
    };
    if (this.screenIsMobile) {
      config.minWidth = '98%';
      config.position = {
        top: '4px'
      };
    }
    this.dialog.open(DialogCreateDocComponent, config).afterClosed().subscribe((rem: Document) => {
      if (rem) {
        this.remindList.unshift(rem);
      }
    });
  }

  onDelete(rem: Document) {
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
