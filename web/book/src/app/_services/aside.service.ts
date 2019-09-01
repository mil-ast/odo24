import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AsideService {
  asideVisible: Observable<boolean>;
  private asideVisible$ = new BehaviorSubject(false);

  constructor() {
    this.asideVisible = this.asideVisible$.asObservable();
  }

  setAsideVisible(value: boolean) {
    this.asideVisible$.next(value);
  }

  getAsideVslue(): boolean {
    return this.asideVisible$.getValue();
  }
}
