import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ServiceStruct {
    service_id?: number;
    avto_id?: number;
    comment?: string;
    price?: number;
    date?: string;
    group_id?: number;
    odo: number;
    next_distance?: number;
}

@Injectable()
export class ServiceService {
  private url = '/api/services';

  constructor(
    private http: HttpClient
  ) { }

  get(avto_id: number, group_id: number): Observable<ServiceStruct[]> {
    return this.http.get<ServiceStruct[]>(`${this.url}?avto_id=${avto_id}&group_id=${group_id}`).pipe(
      map((data: ServiceStruct[]) => {
        if (!Array.isArray(data)) {
          return [];
        }

        return data.sort((a: ServiceStruct, b: ServiceStruct) => {
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

  create(data: ServiceStruct): Observable<ServiceStruct> {
    return this.http.post<ServiceStruct>(this.url, data);
  }

  update(data: ServiceStruct): Observable<ServiceStruct> {
    return this.http.put<ServiceStruct>(this.url, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(this.url.concat(`?service_id=${id}`));
  }
}
