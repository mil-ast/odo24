import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-confirm-code',
  templateUrl: './confirm-code.component.html'
})
export class ConfirmCodeComponent {
  @Input() login: string;
  @Output() codeEnter: EventEmitter<number> = new EventEmitter();
  form: FormGroup;

  constructor() {
    this.form = new FormGroup({
      code: new FormControl(null, [Validators.required, Validators.min(10000), Validators.max(99999)]),
    });
  }

  submitConfirmCode() {
    if (this.form.invalid) {
      return false;
    }
    const code = this.form.get('code').value;
    this.codeEnter.emit(code);
  }
}
