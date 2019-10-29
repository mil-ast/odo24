import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { GroupService, GroupStruct, GroupStructModify } from 'src/app/_services/groups.service';

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
    @Inject(MAT_DIALOG_DATA) public data: GroupStructModify,
  ) {
    this.form = new FormGroup({
      name : new FormControl(data.group_name, Validators.required),
    });
  }

  submit() {
    const data: GroupStructModify = {
      group_name: this.form.get('name').value,
    };
    this.groupService.update(data).subscribe((group: GroupStruct) => {
      this.data.group_name = data.group_name;
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
