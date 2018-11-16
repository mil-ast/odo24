import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MatSnackBar, MAT_DIALOG_DATA} from '@angular/material';
import { GroupsService } from '../../services/groups.service';
import { Group } from '../../classes/group';

@Component({
    selector: 'dialog-group-update',
    templateUrl: './group-update.component.html',
    styleUrls: ['./group-update.component.css']
})
export class DialogGroupUpdateComponent {
    public formUpdateGroup: FormGroup;

    constructor(
        private fb: FormBuilder,
        public snackBar: MatSnackBar,
        public dialogRef: MatDialogRef<DialogGroupUpdateComponent>,
        @Inject(MAT_DIALOG_DATA) public data: Group,
        private serviceGroup: GroupsService,
    ) {
		this.formUpdateGroup = this.fb.group({
			name: [data.name, [Validators.required, Validators.minLength(2)]],
		});
    }

    Submit() {
        this.formUpdateGroup.disable();
        
        const data = {
            group_id : this.data.group_id,
            name : this.formUpdateGroup.value.name
        };

		const req = this.serviceGroup.Update(data);
		req.subscribe((res: any) => {
            this.data.Update(res.name);

			this.snackBar.open('Изменения успешно сохранены!', 'OK', {
				duration: 5000,
            });
            
            this.dialogRef.close(this.data);
		}, () => {
			this.snackBar.open('Что-то пошло не так!', 'OK', {
				duration: 5000,
				panelClass : 'error',
            });
            
            this.formUpdateGroup.enable();
		});
        return false;
    }
}
