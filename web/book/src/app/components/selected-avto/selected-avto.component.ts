import { Component, Input } from '@angular/core';
import { Avto } from '../../_classes/avto';

@Component({
  selector: 'app-selected-avto',
  templateUrl: './selected-avto.component.html',
  styleUrls: ['./selected-avto.component.css']
})
export class SelectedAvtoComponent {
    @Input() model: Avto;

    constructor() { }
}
