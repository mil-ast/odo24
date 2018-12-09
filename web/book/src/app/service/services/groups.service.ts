import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class GroupsService {
  private url = '/api/groups';

  constructor(
    private http: HttpClient
  ) { }

  Get() {
    return this.http.get(this.url);
  }

  Create(data: any) {
    return this.http.post(this.url, data);
  }

  Update(data: any) {
    return this.http.put(this.url, data);
  }

  Delete(group_id: number) {
    return this.http.delete(this.url.concat('?group_id=', group_id.toString()));
  }
}
