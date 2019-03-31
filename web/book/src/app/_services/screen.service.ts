import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';

export const SmallScreen = 860;

export interface Screen {
  innerWidth: number;
  innerHeight: number;
}

@Injectable({
  providedIn: 'root'
})
export class ScreenService {
  private screenSubject: BehaviorSubject<Screen> = new BehaviorSubject({
    innerWidth: window.innerWidth,
    innerHeight: window.innerHeight
  });

  onResize(innerWidth: number, innerHeight: number) {
    this.screenSubject.next({
      innerWidth: innerWidth,
      innerHeight: innerHeight
    });
  }

  getScreen(): Observable<Screen> {
    return this.screenSubject.asObservable();
  }
}
