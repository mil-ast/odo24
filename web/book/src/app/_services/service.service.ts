import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

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

  get(avto_id: number, group_id: number): Observable<ServiceStruct[]> {
    return this.http.get<ServiceStruct[]>(`${this.url}?avto_id=${avto_id}&group_id=${group_id}`).pipe(
      tap((data: ServiceStruct[]) => {
        const list = data || [];
        return list.sort((a: ServiceStruct, b: ServiceStruct) => {
          if (a.date > b.date) {
            return -1;
          } else if (a.date < b.date) {
            return 1;
          }
          return 0;
        });
      }
    ));
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
