import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {
  @Input() login: string;
  @Input() code: number;
  @Output() passwordEnter: EventEmitter<void> = new EventEmitter();

  form: FormGroup;
  constructor() {
    this.form = new FormGroup({
      password: new FormControl('',  [Validators.required, Validators.minLength(5)]),
      password2: new FormControl(''),
    }, (fg: FormGroup) => {
      if (fg.get('password').value !== fg.get('password2').value) {
        return {
          password2: true
        };
      }
      return null;
    });
  }

  ngOnInit() {

  }

  submitPassword() {
    const password = this.form.get('password').value;
    this.passwordEnter.emit();
  }
}
