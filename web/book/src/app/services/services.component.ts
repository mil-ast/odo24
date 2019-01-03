import { Component, OnInit, OnDestroy } from '@angular/core';
import { AvtoService } from '../_services/avto.service';
import { AvtoStruct } from '../_classes/avto';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-services',
  templateUrl: './services.component.html',
  styleUrls: ['./services.component.css']
})
export class ServicesComponent implements OnInit, OnDestroy {
  avtoList: AvtoStruct[] = [];

  selectedAvto: AvtoStruct = null;
  isSync = true;

  private avtoListener: Subscription;

  constructor(
    private avtoService: AvtoService,
  ) { }

  ngOnInit() {
    this.avtoListener = this.avtoService.selected.subscribe((avto: AvtoStruct) => {
      this.selectedAvto = avto;
    });

    this.avtoService.get().subscribe((list: AvtoStruct[]) => {
      this.avtoList = list;
      if (Array.isArray(list) && list.length > 0) {
        this.avtoService.setSelected(list[0]);
      }

      this.isSync = false;
    });
  }

  ngOnDestroy() {
    this.avtoListener.unsubscribe();
  }
}
