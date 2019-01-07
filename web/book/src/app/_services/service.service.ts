import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ServiceStruct {
    avto_id: number;
    comment: string;
    date: string;
    group_id: number;
    odo: number;
    service_id: number;
}

@Injectable()
export class ServiceService {
  private url = '/api/services';

  constructor(
    private http: HttpClient
  ) { }

  get(): Observable<ServiceStruct[]> {
    return this.http.get<ServiceStruct[]>(this.url);
  }

  create(data: ServiceStruct) {
    return this.http.post(this.url, data);
  }

  update(data: FormData) {
    return this.http.put(this.url, data);
  }

  delete(id: number) {
    return this.http.delete(this.url.concat(`?service_id=${id}`));
  }
}
