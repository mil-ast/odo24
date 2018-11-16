import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Avto } from '../../../_classes/avto';

@Component({
	selector: 'app-avto',
	templateUrl: './avto.component.html',
	styleUrls: ['../../../_css/avto_item.css']
})
export class AvtoComponent implements OnInit {
	@Input() model: Avto;
	@Input() selected: boolean;
	@Output() eventSelectAvto: EventEmitter<Avto> = new EventEmitter();

	constructor() { }

	ngOnInit() {
	}

	ClickSelectAvto() {
		this.eventSelectAvto.emit(this.model);
		return false;
	}
}
