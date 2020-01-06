import { Injectable } from '@angular/core';
import { SwUpdate, UpdateAvailableEvent } from '@angular/service-worker';
import { MatSnackBar } from '@angular/material';

@Injectable({
  providedIn: 'root'
})
export class AppUpdateService {
  constructor(
    private updates: SwUpdate,
    private snackbar: MatSnackBar,
  ) {
    this.updates.available.subscribe((value: UpdateAvailableEvent) => {
      this.showAppUpdateAlert(value);
    });
  }

  showAppUpdateAlert(value: UpdateAvailableEvent) {
    const header = 'App Update available';
    const message = `Type: ${value.type}, current: ${value.current.hash}, available: ${value.available.hash}`;
    const action = this.doAppUpdate;
    const caller = this;
    console.log(header, message, action, caller);

    this.snackbar.open('Доступна новая версия', 'Обновить', {
      duration: 10000
    }).onAction().subscribe(() => {
      window.location.reload();
    });
  }
  
  doAppUpdate() {
    this.updates.activateUpdate().then(() => document.location.reload());
  }
}
