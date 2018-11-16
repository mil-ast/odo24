import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MatSnackBar, MAT_DIALOG_DATA} from '@angular/material';
import { GroupsService } from '../../services/groups.service';
import { Group } from '../../classes/group';

@Component({
    selector: 'dialog-group-create',
    templateUrl: './group-create.component.html',
    styleUrls: ['./group-create.component.css']
})
export class DialogGroupCreateComponent {
    public formCreateGroup: FormGroup;

    constructor(
        private fb: FormBuilder,
        public snackBar: MatSnackBar,
        public dialogRef: MatDialogRef<DialogGroupCreateComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private serviceGroup: GroupsService,
    ) {
		this.formCreateGroup = this.fb.group({
			name: ['', [Validators.required, Validators.minLength(2)]],
		});
    }

    Submit() {
        this.formCreateGroup.disable();
        
        const data = {
            name : this.formCreateGroup.value.name
        };

		const req = this.serviceGroup.Create(data);
		req.subscribe((res: any) => {
			const group = new Group(res.group_id, res.name, 'USER', []);

			this.snackBar.open('Группа добавлена!', 'OK', {
				duration: 5000,
            });
            
            this.dialogRef.close(group);
		}, () => {
			this.snackBar.open('Что-то пошло не так!', 'OK', {
				duration: 5000,
				panelClass : 'error',
            });
            
            this.formCreateGroup.enable();
		});
        return false;
    }
}
