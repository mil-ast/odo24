import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as moment from 'moment';

export interface Document {
	doc_id: number;
	auto_id?: number;
	date_start?: string;
	date_end: string;
	descript?: string;
	is_closed: boolean;
	doc_type_id: number;
}

@Injectable()
export class DocumentsService {
  private readonly baseURL = '/api/documents';

  constructor(
    private http: HttpClient,
  ) { }

  getAll(): Observable<Document[]> {
    return this.http.get<Document[]>(this.baseURL).pipe(
      map((list: Document[]) => {
        return (list || []).sort((a: Document, b: Document) => {
          if (a.date_end > b.date_end) {
            return -1;
          } else if (a.date_end < b.date_end) {
            return 1;
          }
          return 0;
        });
      })
    );
  }

  create(autoID: number, dtStart: string, dtEnd: string, descript: string, docTypeID: number): Observable<{doc_id: number}> {
    return this.http.post<{doc_id: number}>(`${this.baseURL}/`, {
      auto_id: autoID ? autoID : null,
      date_start: dtStart,
      date_end: dtEnd,
      descript: descript ? descript : null,
      doc_type_id: docTypeID,
    });
  }

  update(docID: number, autoID: number, dtStart: string, dtEnd: string, descript: string): Observable<void> {
    return this.http.put<void>(`${this.baseURL}/${docID}`, {
      auto_id: autoID ? autoID : null,
      date_start: dtStart,
      date_end: dtEnd,
      descript: descript ? descript : null
    });
  }
}
