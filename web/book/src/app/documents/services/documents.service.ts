import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Document {
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
export class DocumentsService {
  private url = '/api/documents';

  constructor(private http: HttpClient) { }

  get(): Observable<Document[]> {
    return this.http.get<Document[]>(this.url);
  }

  create(data: Document): Observable<Document> {
    return this.http.post<Document>(this.url, data);
  }

  update(data: Document): Observable<Document> {
    return this.http.put<Document>(this.url, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(this.url, {
      params: {
        id: `${id}`
      }
    });
  }
}
