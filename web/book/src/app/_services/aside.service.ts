import { Injectable } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';

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
