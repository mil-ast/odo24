import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Service {
  odo?: number;
  next_distance?: number;
  dt: string;
  description?: string;
  price?: number;
}

export interface ServiceStruct extends Service {
  service_id: number;
}

export interface ServiceCreate extends Service {
  auto_id: number;
  group_id: number;
}

@Injectable()
export class ServiceService {
  private readonly url = '/api/services';

  constructor(
    private http: HttpClient
  ) { }

  get(avto_id: number, group_id: number): Observable<ServiceStruct[]> {
    return this.http.get<ServiceStruct[]>(`${this.url}?auto_id=${avto_id}&group_id=${group_id}`).pipe(
      map((data: ServiceStruct[]) => this.sort(data || [])
    ));
  }

  create(data: ServiceCreate): Observable<ServiceStruct> {
    return this.http.post<ServiceStruct>(this.url, data);
  }

  update(serviceID: number, body: Service): Observable<void> {
    return this.http.put<void>(`${this.url}/${serviceID}`, body);
  }

  delete(serviceID: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${serviceID}`);
  }

  sort(data: ServiceStruct[]): ServiceStruct[] {
    return (data || []).sort((a: ServiceStruct, b: ServiceStruct) => {
      if (a.dt > b.dt) {
        return -1;
      } else if (a.dt < b.dt) {
        return 1;
      }
      return 0;
    });
  }

  getLastSorted(list: ServiceStruct[]): ServiceStruct {
    if (!Array.isArray(list) || list.length === 0) {
      return null;
    }

    return list[0];
  }
}
