import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { RegisterService } from '../services/register.service';
import { ToastrService } from 'ngx-toastr';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-confirm-code',
  templateUrl: './confirm-code.component.html',
  styleUrls: ['./confirm-code.component.scss']
})
export class ConfirmCodeComponent implements OnInit {
  @Input() login: string;
  @Output() codeEnter: EventEmitter<number> = new EventEmitter();
  form: FormGroup;

  constructor(
    private registerService: RegisterService,
    private toastr: ToastrService,
  ) {
    this.form = new FormGroup({
      code: new FormControl('', Validators.required),
    });
  }

  ngOnInit() {
  }

  submitConfirmCode() {
    const code = this.form.get('code').value;

    this.registerService.confirmCode(this.login, code, null).subscribe(() => {
      this.codeEnter.emit(code);
    }, (err: HttpErrorResponse) => {
      this.toastr.error('Ошибка при подтверждении почты');
    });
  }
}
