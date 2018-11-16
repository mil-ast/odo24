import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class ServicesService {
	private url = '/api/services';

	constructor(
		private http: HttpClient
	) { }

	Get() {
		return this.http.get(this.url);
	}

	Create(data) {
		return this.http.post(this.url, data);
	}

	Update(data) {
		return this.http.put(this.url, data);
	}

	Delete(id: number) {
		return this.http.delete(this.url.concat('?service_id=', id.toString()));
	}
}
