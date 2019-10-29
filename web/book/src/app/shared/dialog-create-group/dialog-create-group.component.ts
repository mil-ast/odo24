import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { GroupService, GroupStruct, GroupStructModify } from 'src/app/_services/groups.service';

@Component({
  selector: 'app-dialog-create-group',
  templateUrl: './dialog-create-group.component.html',
})
export class DialogCreateGroupComponent {
  constructor(
    private dialogRef: MatDialogRef<DialogCreateGroupComponent>,
    private snackBar: MatSnackBar,
    private groupService: GroupService,
    @Inject(MAT_DIALOG_DATA) data: any,
  ) { }

  form: FormGroup = new FormGroup({
    name : new FormControl('', Validators.required),
  });

  submit() {
    const data: GroupStructModify = {
      group_name: this.form.get('name').value,
    };
    this.groupService.create(data).subscribe((group: GroupStruct) => {
      this.dialogRef.close(group);

      this.snackBar.open('Группа успешно добавлена!', 'OK', {
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
