import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProfileService } from '../../_services/profile.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  login: string;
  code: number;
  step = 'new-login';

  constructor(
    private router: Router,
    
    private profileService: ProfileService,
  ) {}

  ngOnInit() {
  }

  onLoginEnter(login: string) {
    this.login = login;
    this.step = 'confirm-code';
  }

  onCodeEnter(code: number) {
    console.log(code);
    this.code = code;

    this.step = 'set-password';
  }

  onPasswordEnter() {
    this.router.navigate(['/login']);
  }
}
