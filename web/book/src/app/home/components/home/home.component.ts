import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProfileService } from '../../../_services/profile.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
    login: string = '';
    password: string = '';
    isIncorrect: boolean = false;
    isFormRegister: boolean = false;

    public formRegister: FormGroup;

    constructor(
        private fb: FormBuilder,
        private profileService: ProfileService
    ) {
		this.formRegister = this.fb.group({
			login: ['', [Validators.required, Validators.email]],
			password: ['', [Validators.minLength(3) ]],
		});
    }

    ngOnInit() {
        const login = localStorage.getItem('login');
        const password = localStorage.getItem('password');
        if (login !== null || password !== null) {
            this.formRegister.patchValue({
                login : login,
                password : password,
            });

            localStorage.removeItem('login');
            localStorage.removeItem('password');
        }
    }

    SubmitLogin() {
        this.profileService.Login(this.login, this.password);
        return false;
    }

    ToggleFormRegister(event: boolean) {
        this.isFormRegister = event;
        return false;
    }
}
