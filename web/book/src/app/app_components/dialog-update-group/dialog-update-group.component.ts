import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatSnackBar } from '@angular/material';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { GroupService, GroupStruct } from 'src/app/_services/groups.service';

@Component({
  selector: 'app-dialog-update-group',
  templateUrl: './dialog-update-group.component.html',
})
export class DialogUpdateGroupComponent {
  form: FormGroup;

  constructor(
    private dialogRef: MatDialogRef<DialogUpdateGroupComponent>,
    private snackBar: MatSnackBar,
    private groupService: GroupService,
    @Inject(MAT_DIALOG_DATA) public data: GroupStruct,
  ) {
    this.form = new FormGroup({
      name : new FormControl(data.name, Validators.required),
    });
  }

  submit() {
    const data: GroupStruct = {
      group_id: this.data.group_id,
      name: this.form.get('name').value,
    };
    this.groupService.update(data).subscribe((group: GroupStruct) => {
      this.data.name = group.name;
      this.dialogRef.close(group);

      this.snackBar.open('Группа успешно сохранена!', 'OK', {
        duration: 5000,
      });
    }, (e) => {
      console.error(e);
      this.snackBar.open('Что-то пошло не так!', 'OK', {
        duration: 5000,
        panelClass: 'error',
      });
    });

    return false;
  }
}
