import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Avto, AvtoStruct } from '../_classes/avto';
import { Observable, BehaviorSubject, Subscriber } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class AvtoService {
  private url = '/api/avto';

  private selectedAvto: BehaviorSubject<AvtoStruct> = new BehaviorSubject(null);
  selected: Observable<AvtoStruct> = this.selectedAvto.asObservable();

  constructor(
    private http: HttpClient
  ) { }

  get(): Observable<AvtoStruct[]> {
    return this.http.get<AvtoStruct[]>(this.url).pipe(tap((data: AvtoStruct[]) => {
      const list = data || [];
      return list.sort((a: AvtoStruct, b: AvtoStruct) => {
        if (a.avto_id > b.avto_id) {
          return 1;
        }
        return -1;
      });
    }));
  }

  create(data: AvtoStruct) {
    return this.http.post(this.url, data);
  }

  update(data: FormData) {
    return this.http.put(this.url, data);
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
