import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Reminding {
  id?: number;
  user_id?: number;
  avto_id?: number;
  event_type: string;
  date_start: string;
  date_end: string;
  days_before_event: number;
  comment: string;
}

@Injectable()
export class RemindingService {
  private url = '/api/reminding';

  constructor(
    private http: HttpClient
  ) { }

  get(): Observable<Reminding[]> {
    return this.http.get<Reminding[]>(this.url);
  }
}
