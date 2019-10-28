import { Injectable } from '@angular/core';

const mobileWidth = 960;

@Injectable({
  providedIn: 'root'
})
export class AsideService {
  constructor() {}

  isMobile(): boolean {
    return window.innerWidth < mobileWidth;
  }
}
