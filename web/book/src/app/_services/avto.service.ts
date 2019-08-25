import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AvtoStruct, Avto } from '../_classes/avto';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class AvtoService {
  private url = '/api/avto';

  private selectedAvto: BehaviorSubject<Avto> = new BehaviorSubject(null);
  selected: Observable<Avto> = this.selectedAvto.asObservable();

  constructor(
    private http: HttpClient
  ) { }

  getAvto(): Observable<Avto[]> {
    return this.http.get<AvtoStruct[]>(this.url).pipe(map((list: AvtoStruct[]) => {
      list = list || [];
      return list.map((item: AvtoStruct) => {
        return new Avto(item);
      }).sort((left: AvtoStruct, right: AvtoStruct) => {
        return left.avto_id > right.avto_id ? -1 : 1;
      });
    }));
  }

  create(data: AvtoStruct): Observable<Avto> {
    return this.http.post<AvtoStruct>(this.url, data).pipe(
      map((item: AvtoStruct) => {
        return new Avto(item);
      })
    );
  }

  update(data: FormData): Observable<AvtoStruct> {
    return this.http.put<AvtoStruct>(this.url, data);
  }

  delete(id: number) {
    return this.http.delete(this.url.concat(`?avto_id=${id}`));
  }

  setSelected(avto: Avto) {
    this.selectedAvto.next(avto);
  }
  getSelected(): Avto {
    return this.selectedAvto.getValue();
  }
  resetSelected(): void {
    this.selectedAvto.next(null);
  }

  isSelected(avto: AvtoStruct): boolean {
    return this.selectedAvto.getValue() === avto;
  }
}
