import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AutoStruct, Auto } from '../_classes/auto';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class AutoService {
  private readonly url = '/api/auto';
  private readonly urlItem = '/api/auto_item';

  private selectedAuto: BehaviorSubject<Auto> = new BehaviorSubject(null);
  selected: Observable<Auto> = this.selectedAuto.asObservable();

  constructor(
    private http: HttpClient
  ) { }

  getAuto(): Observable<Auto[]> {
    return this.http.get<AutoStruct[]>(this.url).pipe(map((list: AutoStruct[]) => {
      const autoList = (list || []).map((item: AutoStruct) => {
        return new Auto(item);
      }).sort((left: AutoStruct, right: AutoStruct) => left.auto_id > right.auto_id ? -1 : 1);

      if (autoList.length > 0) {
        this.selectedAuto.next(autoList[0]);
      }

      return autoList;
    }));
  }

  create(data: AutoStruct): Observable<Auto> {
    return this.http.post<AutoStruct>(this.url, data).pipe(
      map((item: AutoStruct) => new Auto(item))
    );
  }

  update(autoID: number, data: FormData): Observable<AutoStruct> {
    return this.http.put<AutoStruct>(`${this.urlItem}/${autoID}/`, data);
  }

  updateODO(autoID: number, odo: number): Observable<void> {
    return this.http.put<void>(`${this.urlItem}/${autoID}/odo`, {
      odo: odo
    });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.urlItem}/${id}/`);
  }

  setSelected(auto: Auto | null) {
    if (auto === null) {
      this.selectedAuto.next(null);
    } else {
      const selectedAuto = this.selectedAuto.getValue();
      const selectedAutoID = selectedAuto ? selectedAuto.auto_id : null;
      const newAutoID = auto ? auto.auto_id : null;
      if (selectedAutoID !== newAutoID) {
        this.selectedAuto.next(auto);
      }
    }
  }
}
