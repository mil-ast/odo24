import { Component, OnInit, Input } from '@angular/core';
import { AvtoStruct } from 'src/app/_classes/avto';
import { AvtoService } from 'src/app/_services/avto.service';

@Component({
  selector: 'app-item-avto',
  templateUrl: './item-avto.component.html',
  styleUrls: ['./item-avto.component.css']
})
export class ItemAvtoComponent implements OnInit {
  @Input() model: AvtoStruct;
  constructor(private avtoService: AvtoService) { }

  ngOnInit() {
  }

  get imageURL(): string {
    if (this.model.avatar) {
      return `/api/images/small/${this.model.avto_id}.jpg`;
    }
    return '/assets/images/no_photo_small.png';
  }

  get selected(): boolean {
    return this.avtoService.isSelected(this.model);
  }

  clickSelect(event: MouseEvent) {
    event.preventDefault();

    this.avtoService.setSelected(this.model);
  }
}
