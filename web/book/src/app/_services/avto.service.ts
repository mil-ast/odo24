import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AutoStruct, Auto } from '../_classes/auto';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class AutoService {
  private url = '/api/auto';
  private urlItem = '/api/auto_item';

  private selectedAuto: BehaviorSubject<Auto> = new BehaviorSubject(null);
  selected: Observable<Auto> = this.selectedAuto.asObservable();

  constructor(
    private http: HttpClient
  ) { }

  getAuto(): Observable<Auto[]> {
    return this.http.get<AutoStruct[]>(this.url).pipe(map((list: AutoStruct[]) => {
      const autoList = (list || []).map((item: AutoStruct) => {
        return new Auto(item);
      }).sort((left: AutoStruct, right: AutoStruct) => {
        return left.avto_id > right.avto_id ? -1 : 1;
      });

      if (autoList.length > 0) {
        this.selectedAuto.next(autoList[0]);
      }

      return autoList;
    }));
  }

  create(data: AutoStruct): Observable<Auto> {
    return this.http.post<AutoStruct>(this.url, data).pipe(
      map((item: AutoStruct) => {
        return new Auto(item);
      })
    );
  }

  update(autoID: number, data: FormData): Observable<AutoStruct> {
    return this.http.put<AutoStruct>(`${this.urlItem}/${autoID}/`, data);
  }

  delete(id: number) {
    return this.http.delete(`${this.url}/${id}/`);
  }

  setSelected(auto: Auto) {
    const selectedAuto = this.selectedAuto.getValue();
    const selectedAutoID = selectedAuto ? selectedAuto.auto_id : null;
    const newAutoID = auto ? auto.auto_id : null;
    if (selectedAutoID !== newAutoID) {
      this.selectedAuto.next(auto);
    }
  }
  getSelected(): Auto {
    return this.selectedAuto.getValue();
  }
  resetSelected(): void {
    this.selectedAuto.next(null);
  }

  isSelected(auto: AutoStruct): boolean {
    return this.selectedAuto.getValue() === auto;
  }
}
