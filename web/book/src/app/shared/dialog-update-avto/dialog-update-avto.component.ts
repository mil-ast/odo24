import { Component, Inject, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatSnackBar } from '@angular/material';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { AvtoService } from 'src/app/_services/avto.service';
import { AvtoStruct, Avto } from 'src/app/_classes/avto';
import { ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-dialog-update-avto',
  templateUrl: './dialog-update-avto.component.html',
  styleUrls: ['./dialog-update-avto.component.css']
})
export class DialogUpdateAvtoComponent implements OnDestroy {
  form: FormGroup;
  uploaded_file: File = null;
  private destroy: ReplaySubject<boolean> = new ReplaySubject(1);

  constructor(
    private dialogRef: MatDialogRef<DialogUpdateAvtoComponent>,
    private avtoService: AvtoService,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: Avto,
  ) {
    this.form = new FormGroup({
      name: new FormControl(data.name, Validators.required),
      odo: new FormControl(data.odo, [Validators.required, Validators.min(0), Validators.pattern(/[\d]+/)]),
    });
  }

  ngOnDestroy() {
    this.destroy.next(null);
    this.destroy.complete();
  }

  submit() {
    this.form.disable();

    const formData = new FormData();
    formData.append('name', this.form.value.name);
    formData.append('avto_id', this.data.avto_id.toString());
    formData.append('odo', (this.form.value.odo | 0).toString());

    if (this.uploaded_file !== null) {
      formData.append('file', this.uploaded_file, this.uploaded_file.name);
    }

    this.avtoService.update(formData).pipe(
      takeUntil(this.destroy),
    ).subscribe((res: AvtoStruct) => {
      this.data.update(res.name, res.odo, res.avatar);

      this.snackBar.open('Изменения успешно сохранены!', 'OK', {
        duration: 5000,
      });

      this.dialogRef.close(this.data);
    }, (err) => {
      console.error(err);
      this.snackBar.open('Что-то пошло не так!', 'OK', {
        duration: 5000,
        panelClass: 'error',
      });

      this.form.enable();
    });

    return false;
  }

  selectedFileUpload(event) {
    const fileList: FileList = event.target.files;
    if (fileList.length === 0) {
      return;
    }

    this.uploaded_file = fileList[0];
  }

  formatFileSize(size: number = 0): string {
    let file_size: number;

    if (size > 1048576) { // 1mb
      file_size = Math.round((size / (1 << 20)) * 10) / 10;
      return `${file_size} MB`;
    } else if (size > 1024) {
      file_size = Math.round((size / 1024) * 10) / 10;
      return `${file_size} KB`;
    }

    return `${file_size} B`;
  }

  clickSyncODO(ev: MouseEvent) { }
}
