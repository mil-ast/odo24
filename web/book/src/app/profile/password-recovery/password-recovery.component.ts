import { Component } from '@angular/core';
import { Router } from '@angular/router';

enum Step {
  EnterLogin = 1,
  ConfirmCode = 2,
  SetPassword = 3,
}

@Component({
  selector: 'app-password-recovery',
  templateUrl: './password-recovery.component.html',
  styleUrls: ['./password-recovery.component.scss']
})
export class PasswordRecoveryComponent {
  login: string;
  code: number;
  step = Step;
  currentStep: Step = Step.EnterLogin;
  
  constructor(
    private router: Router
  ) { }

  onLoginEnter(login: string) {
    this.login = login;
    this.currentStep = Step.ConfirmCode;
  }

  onCodeEnter(code: number) {
    this.code = code;
    this.currentStep = Step.SetPassword;
  }

  onPasswordEnter() {
    this.router.navigate(['/profile/login']);
  }
}
