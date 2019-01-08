import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface GroupStruct {
    group_id: number;
    name: string;
    order: number;
    global: boolean;
    cnt: number;
}

@Injectable()
export class GroupService {
  private url = '/api/groups';

  private selectedGroup: BehaviorSubject<GroupStruct> = new BehaviorSubject(null);
  selected: Observable<GroupStruct> = this.selectedGroup.asObservable();

  constructor(
    private http: HttpClient
  ) { }

  get(): Observable<GroupStruct[]> {
    return this.http.get<GroupStruct[]>(this.url).pipe(tap((data: GroupStruct[]) => {
      const list = data || [];
      return list.sort((a: GroupStruct, b: GroupStruct) => {
        /*if (a.global && !a.global) {
          return -1;
        } else if (!a.global && a.global) {
          return 1;
        }*/

        if (a.order > b.order) {
          return 1;
        } else if (a.order < b.order) {
          return -1;
        }
        return 0;
      });
    }));
  }

  create(data: GroupStruct) {
    return this.http.post(this.url, data);
  }

  update(data: FormData) {
    return this.http.put(this.url, data);
  }

  delete(id: number) {
    return this.http.delete(this.url.concat(`?group_id=${id}`));
  }

  setSelected(avto: GroupStruct) {
    this.selectedGroup.next(avto);
  }
  resetSelected(): void {
    this.selectedGroup.next(null);
  }

  isSelected(avto: GroupStruct): boolean {
    return this.selectedGroup.getValue() === avto;
  }
}
