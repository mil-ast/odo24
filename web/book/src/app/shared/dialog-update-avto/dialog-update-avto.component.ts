import { Component, Inject, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { AutoService } from 'src/app/_services/avto.service';
import { AutoStruct, Auto } from 'src/app/_classes/auto';
import { ReplaySubject } from 'rxjs';
import { takeUntil, mergeMap, map, finalize } from 'rxjs/operators';
import { BluetoothCore } from '@manekinekko/angular-web-bluetooth';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-dialog-update-avto',
  templateUrl: './dialog-update-avto.component.html',
  styleUrls: ['./dialog-update-avto.component.css'],
  providers: [ BluetoothCore ]
})
export class DialogUpdateAvtoComponent implements OnDestroy {
  error: any;
  form: FormGroup;
  uploaded_file: File = null;
  private destroy: ReplaySubject<boolean> = new ReplaySubject(1);

  constructor(
    private dialogRef: MatDialogRef<DialogUpdateAvtoComponent>,
    private avtoService: AutoService,
    private toastr: ToastrService,
    @Inject(MAT_DIALOG_DATA) public data: Auto,
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
    formData.append('odo', (this.form.value.odo | 0).toString());

    let avatar = !!this.data.avatar;
    if (this.uploaded_file !== null) {
      formData.append('file', this.uploaded_file, this.uploaded_file.name);
      avatar = true;
    }

    this.avtoService.update(this.data.auto_id, formData).pipe(
      finalize(() => { this.form.enable(); }),
      takeUntil(this.destroy),
    ).subscribe(() => {
      this.data.update(this.form.value.name, this.form.value.odo, avatar);

      this.toastr.success('Изменения успешно сохранены!');
      this.dialogRef.close();
    }, (err) => {
      console.error(err);
      this.toastr.error('Произошла ошибка при сохранении авто');
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

  clickSyncODO(ev: MouseEvent) {
    navigator.bluetooth.requestDevice({
      acceptAllDevices: false,
      filters: [
        {services: [0x1802, 0x1803]},
        {services: ['c48e6067-5295-48d3-8d5c-0395f61792b1']},
      ]
    }).then((e) => {
      console.log(e);
    });
  }
}
