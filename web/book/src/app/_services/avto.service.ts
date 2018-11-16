import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Avto } from '../_classes/avto';

@Injectable()
export class AvtoService {
	private url = '/api/avto';

	private selectedAvto: Avto = null;

	constructor(
		private http: HttpClient
	) { }

	Get() {
		return this.http.get(this.url);
	}

	Create(data) {
		return this.http.post(this.url, data);
	}

	Update(data: FormData) {
		return this.http.put(this.url, data);
	}

	Delete(id) {
		return this.http.delete(this.url.concat('?avto_id=', id.toString()));
	}

	SetSelected(avto: Avto): Avto {
		this.selectedAvto = avto;
		return this.GetSelected();
	}
	ResetSelected(): void {
		this.selectedAvto = null;
	}

	GetSelected(): Avto {
		return this.selectedAvto;
	}
}
