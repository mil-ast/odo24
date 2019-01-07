import { Component, OnInit, Input } from '@angular/core';
import { ServiceStruct } from 'src/app/_services/service.service';

@Component({
  selector: 'app-item-service',
  templateUrl: './item-service.component.html',
  styleUrls: [
    '../../_css/item_list.css',
    './item-service.component.css',
  ]
})
export class ItemServiceComponent implements OnInit {
  @Input() model: ServiceStruct;
  constructor() { }

  ngOnInit() {
  }

}
