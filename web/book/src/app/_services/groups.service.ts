import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';

export interface GroupStruct {
    group_id: number;
    group_name: string;
    sort: number;
}
export interface GroupsStats {
    group_id?: number;
    cnt?: number;
}

@Injectable()
export class GroupService {
  private url = '/api/groups';

  private selectedGroup: BehaviorSubject<GroupStruct> = new BehaviorSubject(null);
  selected: Observable<GroupStruct> = this.selectedGroup.asObservable();

  constructor(
    private http: HttpClient
  ) { }

  get(avtoId: number = 0): Observable<GroupStruct[]> {
    return this.http.get<GroupStruct[]>(this.url, {
      params: {
        avto_id: `${avtoId}`
      }
    }).pipe(map((list: GroupStruct[]) => {
      return (list || []).sort((a: GroupStruct, b: GroupStruct) => a.sort - b.sort);
    }, tap((list: GroupStruct[]) => {
      const selectedGroup = this.selectedGroup.getValue();
      if (list.length > 0 && selectedGroup === null) {
        this.setSelected(list[0]);
      }
    })));
  }

  getStats(avtoId: number): Observable<GroupsStats[]> {
    return this.http.get<GroupsStats[]>(`${this.url}/stats`, {
      params: {
        avto_id: avtoId.toString()
      }
    });
  }

  create(data: GroupStruct) {
    return this.http.post(this.url, data);
  }

  update(data: GroupStruct) {
    return this.http.put(this.url, data);
  }

  delete(id: number) {
    return this.http.delete(this.url.concat(`?group_id=${id}`));
  }

  setSelected(group: GroupStruct) {
    this.selectedGroup.next(group);
  }
  getSelected(): GroupStruct {
    return this.selectedGroup.getValue();
  }
  resetSelected(): void {
    this.selectedGroup.next(null);
  }

  isSelected(group: GroupStruct): boolean {
    return this.selectedGroup.getValue() === group;
  }
}
