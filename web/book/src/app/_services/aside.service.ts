import { Injectable } from '@angular/core';
import { MatSidenav } from '@angular/material';

const mobileWidth = 960;

@Injectable({
  providedIn: 'root'
})
export class AsideService {
  private sidenav: MatSidenav;
  constructor() {}

  isMobile(): boolean {
    return window.innerWidth < mobileWidth;
  }

  setSidenav(sidenav: MatSidenav) {
    console.log(sidenav);
    this.sidenav = sidenav;
  }

  sidenavToggle() {
    if (this.sidenav) {
      this.sidenav.toggle();
    }
  }

  sidenavClose() {
    if (this.sidenav) {
      this.sidenav.close();
    }
  }
}
