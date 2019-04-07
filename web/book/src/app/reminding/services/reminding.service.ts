import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Reminding {
  id?: number;
  user_id?: number;
  avto_id?: number;
  event_type?: string;
  date_start: string;
  date_end: string;
  days_before_event: number;
  comment: string;
}

@Injectable()
export class RemindingService {
  private url = '/api/reminding';

  constructor(private http: HttpClient) { }

  get(): Observable<Reminding[]> {
    return this.http.get<Reminding[]>(this.url);
  }

  create(data: Reminding): Observable<Reminding> {
    return this.http.post<Reminding>(this.url, data);
  }

  update(data: Reminding): Observable<Reminding> {
    return this.http.put<Reminding>(this.url, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(this.url, {
      params: {
        id: `${id}`
      }
    });
  }
}
