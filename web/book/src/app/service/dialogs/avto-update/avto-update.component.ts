import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MatSnackBar, MAT_DIALOG_DATA} from '@angular/material';
import { AvtoService } from '../../../_services/avto.service';
import { Avto } from '../../../_classes/avto';

@Component({
  selector: 'dialog-avto-update',
  templateUrl: './avto-update.component.html',
  styleUrls: ['./avto-update.component.css'],
})
export class DialogAvtoUpdateComponent {
    public formUpdateAvto: FormGroup;
    uploaded_file: File = null;
    
    constructor(
        private fb: FormBuilder,
        public snackBar: MatSnackBar,
        public dialogRef: MatDialogRef<DialogAvtoUpdateComponent>,
        @Inject(MAT_DIALOG_DATA) public data: Avto,
        private serviceAvto: AvtoService,
    ) {
		this.formUpdateAvto = this.fb.group({
			name: [data.name, [Validators.required, Validators.minLength(2)]],
			odo: [data.odo, [Validators.min(0)]],
        });
    }

    Submit() {
        this.formUpdateAvto.disable();

		const formData = new FormData();
		formData.append('name', this.formUpdateAvto.value.name);
		formData.append('avto_id', this.data.avto_id.toString());
		formData.append('odo', (this.formUpdateAvto.value.odo|0).toString());

		if (this.uploaded_file !== null) {
			formData.append('file', this.uploaded_file, this.uploaded_file.name);
		}

		const req = this.serviceAvto.Update(formData);
		req.subscribe((res: any) => {
			this.data.Update(res.name, res.odo, res.avatar);

			if (this.data.avatar) {
				// обновим изображение
				this.data.SetCacheValue((new Date()).getTime());
            }

			this.snackBar.open('Изменения успешно сохранены!', 'OK', {
				duration: 5000,
            });
            
            this.dialogRef.close(this.data);
		}, (err) => {
            console.error(err);
			this.snackBar.open('Что-то пошло не так!', 'OK', {
				duration: 5000,
				panelClass : 'error',
            });
            
            this.formUpdateAvto.enable();
		});
		return false;
    }

	SelectedFileUpload(event) {
		let fileList: FileList = event.target.files;
		
		if (fileList.length === 0) {
			return;
		}

		this.uploaded_file = fileList[0];
	}

	FormatFileSize(size: number = 0): string {
		var file_size: number;

		if (size > 1048576) { // 1mb
			file_size = Math.round((size / (1 << 20))*10) / 10;
			return `${file_size} MB`;
		} else if (size > 1024) {
			file_size = Math.round((size / 1024) * 10) / 10;
			return `${file_size} KB`;
		}

		return `${file_size} B`;
	}
}
