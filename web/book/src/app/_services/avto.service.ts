import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AvtoStruct } from '../_classes/avto';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class AvtoService {
  private url = '/api/avto';

  private selectedAvto: BehaviorSubject<AvtoStruct> = new BehaviorSubject(null);
  selected: Observable<AvtoStruct> = this.selectedAvto.asObservable();

  constructor(
    private http: HttpClient
  ) { }

  get(): Observable<AvtoStruct[]> {
    return this.http.get<AvtoStruct[]>(this.url);
  }

  create(data: AvtoStruct): Observable<AvtoStruct> {
    return this.http.post<AvtoStruct>(this.url, data);
  }

  update(data: FormData): Observable<AvtoStruct> {
    return this.http.put<AvtoStruct>(this.url, data);
  }

  delete(id: number) {
    return this.http.delete(this.url.concat(`?avto_id=${id}`));
  }

  setSelected(avto: AvtoStruct) {
    this.selectedAvto.next(avto);
  }
  resetSelected(): void {
    this.selectedAvto.next(null);
  }

  isSelected(avto: AvtoStruct): boolean {
    return this.selectedAvto.getValue() === avto;
  }
}
