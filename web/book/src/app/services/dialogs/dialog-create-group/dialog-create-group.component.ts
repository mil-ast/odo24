import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { GroupService, GroupStruct, GroupStructModify } from 'src/app/_services/groups.service';
import { ToastrService } from 'ngx-toastr';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-dialog-create-group',
  templateUrl: './dialog-create-group.component.html',
})
export class DialogCreateGroupComponent {
  constructor(
    private dialogRef: MatDialogRef<DialogCreateGroupComponent>,
    private toastr: ToastrService,
    private groupService: GroupService,
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

      this.toastr.success('Группа успешно добавлена!', null, {timeOut: 3000});
    }, (e: HttpErrorResponse) => {
      console.error(e);
      this.toastr.error('Не удалось удалить группу :(');
    });

    return false;
  }
}
