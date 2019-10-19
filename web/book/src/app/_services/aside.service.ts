import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AsideService {
  private isScreenMobile = false;

  constructor() {
    this.isScreenMobile = window.innerWidth < 600;
  }

  isMobile(): boolean {
    return this.isScreenMobile;
  }
}
