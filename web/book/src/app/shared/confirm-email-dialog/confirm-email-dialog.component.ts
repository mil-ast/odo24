import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatStepper } from '@angular/material';
import { Profile } from 'src/app/_classes/profile';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ProfileService } from 'src/app/_services/profile.service';

@Component({
  selector: 'app-confirm-email-dialog',
  templateUrl: './confirm-email-dialog.component.html',
  styleUrls: ['./confirm-email-dialog.component.css']
})
export class ConfirmEmailDialogComponent implements OnInit {
  @ViewChild('stepper') stepper: MatStepper;
  codeform: FormGroup;

  constructor(
    private profileService: ProfileService,
    private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: Profile,
  ) { }

  ngOnInit() {
    this.codeform = this.fb.group({
      code: ['', [Validators.required, Validators.min(1000), Validators.max(999999)]]
    });
  }

  clickSendEmail() {
    this.profileService.confirmEmail().subscribe(() => {
      this.stepper.next();
    });
  }

  submitCheckCode() {
    if (this.codeform.invalid) {
      return;
    }

    this.profileService.checkCode(this.codeform.controls.code.value).subscribe(() => {
      this.stepper.next();
    });
    console.log();
  }
}
