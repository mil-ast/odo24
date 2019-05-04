import { Component } from '@angular/core';
import { ProfileService } from 'src/app/_services/profile.service';
import { MatSnackBar, MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-prifile-dialog',
  templateUrl: './profile-dialog.component.html',
  styleUrls: ['./profile-dialog.component.css']
})
export class ProfileDialogComponent {
  password = '';
  password2 = '';
  constructor(
    private profileService: ProfileService,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<ProfileDialogComponent>,
  ) { }

  submitUpdateFrofile() {
    if (this.password.length < 5 || this.password !== this.password2) {
      return;
    }

    const req = this.profileService.update({ password: this.password });
    req.subscribe(() => {
      this.password = '';
      this.password2 = '';

      this.snackBar.open('Пароль успешно изменён!', 'OK', {
        duration: 5000,
      });

      this.dialogRef.close();
    }, (err) => {
      console.error(err);

      this.snackBar.open('Что-то пошло не так!', 'OK', {
        duration: 5000,
        panelClass: 'error',
      });
    });
  }
}
