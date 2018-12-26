import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProfileService } from '../../../_services/profile.service';
import { first } from 'rxjs/operators';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
    login = '';
    password = '';
    isIncorrect = false;
    isFormRegister = false;

    public formRegister: FormGroup;

    constructor(
        private fb: FormBuilder,
        private router: Router,
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

    submitLogin() {
        if (!this.login || !this.password) {
            return;
        }

        /*this.profileService.profile$.subscribe((res) => {
            console.log(res);
            if (res !== null) {
                this.router.navigate(['/service']);
            }
        });*/

        this.profileService.login(this.login, this.password);
    }

    ToggleFormRegister(event: boolean) {
        this.isFormRegister = event;
        return false;
    }
}
