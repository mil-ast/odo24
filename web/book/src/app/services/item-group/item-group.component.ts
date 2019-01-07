import { Component, OnInit, Input } from '@angular/core';
import { GroupStruct, GroupService } from 'src/app/_services/groups.service';

@Component({
  selector: 'app-item-group',
  templateUrl: './item-group.component.html',
  styleUrls: [
    './item-group.component.css',
    '../../_css/item_list.css'
  ]
})
export class ItemGroupComponent implements OnInit {
  @Input() model: GroupStruct;
  constructor(private groupService: GroupService) { }

  ngOnInit() {
  }

  get selected(): boolean {
    return this.groupService.isSelected(this.model);
  }

  clickSelect(event: MouseEvent) {
    event.preventDefault();
    this.groupService.setSelected(this.model);
  }
}
