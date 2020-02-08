import { Component, OnInit, Inject } from '@angular/core';
import { Auto } from 'src/app/_classes/auto';
import { AutoService } from 'src/app/_services/avto.service';
import { ToastrService } from 'ngx-toastr';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-dialog-update-avto-odo',
  templateUrl: './dialog-update-avto-odo.component.html',
  styleUrls: ['./dialog-update-avto-odo.component.scss']
})
export class DialogUpdateAvtoOdoComponent implements OnInit {
  odo: number;
  constructor(
    private avtoService: AutoService,
    private toastr: ToastrService,
    private dialogRef: MatDialogRef<DialogUpdateAvtoOdoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Auto,
  ) { }

  ngOnInit() {
    this.odo = this.data.odo;
  }

  clickUpdate() {
    this.avtoService.updateODO(this.data.auto_id, this.odo).subscribe(() => {
      this.toastr.success('Пробег обновлён');
      this.data.odo = this.odo;
      this.dialogRef.close();
    }, (err) => {
      console.error(err);
      this.toastr.error('Не удалось обновить пробег');
    });
  }
}
