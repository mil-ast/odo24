import { Injectable } from '@angular/core';
import { SwUpdate, UpdateAvailableEvent } from '@angular/service-worker';
import { MatSnackBar } from '@angular/material/snack-bar';

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
    const message = `Type: ${value.type}.\r\nCurrent: ${value.current.hash}, available: ${value.available.hash}`;
    console.info(header, message);

    this.snackbar.open('Доступна новая версия', 'Обновить', {
      duration: 60000
    }).onAction().subscribe(() => {
      window.location.reload();
    });
  }
  
  doAppUpdate() {
    this.updates.activateUpdate().then(() => document.location.reload());
  }

  checkForUpdate() {
    if (this.updates.isEnabled) {
      this.updates.checkForUpdate();
    }
  }
}
