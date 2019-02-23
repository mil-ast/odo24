import { Component, OnInit, Input } from '@angular/core';
import { Reminding } from '../services/reminding.service';

@Component({
  selector: 'app-item-remind',
  templateUrl: './item-remind.component.html',
  styleUrls: [
    '../../_css/item_list.css',
    './item-remind.component.css'
  ]
})
export class ItemRemindComponent implements OnInit {
  @Input() model: Reminding;

  constructor() { }

  ngOnInit() {
  }

}
