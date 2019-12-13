import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

 enum Step {
  NewLogin = 1,
  ConfirmCode = 2,
  SetPassword = 3,
}

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  login: string;
  code: number;
  step = Step;
  currentStep: Step = Step.NewLogin;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit() {
    const paramCode = parseInt(this.route.snapshot.queryParams["code"], 10);
    const paramLogin = this.route.snapshot.queryParams["login"];
    if (!isNaN(paramCode) && paramCode > 0 && paramLogin) {
      this.login = paramLogin;
      this.code = paramCode;
      this.currentStep = Step.SetPassword;
    }
  }

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
