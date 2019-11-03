import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

export interface GroupStruct {
  group_id: number;
  group_name: string;
  sort: number;
}
export interface GroupStructModify {
  group_name: string;
}

@Injectable()
export class GroupService {
  private readonly url = '/api/groups';
  private readonly urlGroup = '/api/group';

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
    }).pipe(
      map((list: GroupStruct[]) => {
        const sorted = (list || []).sort((a: GroupStruct, b: GroupStruct) => a.sort - b.sort);
        const selectedGroup = this.selectedGroup.getValue();
        if (list.length > 0 && selectedGroup === null) {
          this.setSelected(list[0]);
        }
        return sorted;
      }
    ));
  }

  saveNewSort(groups: GroupStruct[]): Observable<void> {
    const body = (groups || []).map((group: GroupStruct) => group.group_id);
    return this.http.put<void>(`${this.url}/sort`, body);
  }

  create(data: GroupStructModify) {
    return this.http.post(this.url, data);
  }

  update(groupID: number, data: GroupStructModify) {
    return this.http.put(`${this.urlGroup}/${groupID}`, data);
  }

  delete(groupID: number) {
    return this.http.delete(`${this.urlGroup}/${groupID}`);
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
