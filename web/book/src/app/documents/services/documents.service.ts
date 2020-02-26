import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

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
}
