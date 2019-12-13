import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { GroupService, GroupStruct, GroupStructModify } from 'src/app/_services/groups.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-dialog-update-group',
  templateUrl: './dialog-update-group.component.html',
})
export class DialogUpdateGroupComponent {
  form: FormGroup;

  constructor(
    private dialogRef: MatDialogRef<DialogUpdateGroupComponent>,
    private toastr: ToastrService,
    private groupService: GroupService,
    @Inject(MAT_DIALOG_DATA) public data: GroupStruct,
  ) {
    this.form = new FormGroup({
      name : new FormControl(data.group_name, Validators.required),
    });
  }

  submit() {
    const data: GroupStructModify = {
      group_name: this.form.get('name').value,
    };
    this.groupService.update(this.data.group_id, data).subscribe(() => {
      this.data.group_name = data.group_name;
      this.dialogRef.close();

      this.toastr.success('Изменения сохранены!');
    }, (e) => {
      console.error(e);
      this.toastr.error('Ошибка при сохранении группы');
    });

    return false;
  }
}
