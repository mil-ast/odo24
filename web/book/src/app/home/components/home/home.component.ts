import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProfileService } from '../../../_services/profile.service';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
    isIncorrect = false;
    isSync = false;
    formAuth: FormGroup;

    constructor(
        private fb: FormBuilder,
        private router: Router,
        private profileService: ProfileService
    ) {
        this.formAuth = this.fb.group({
            login: ['', [Validators.required, Validators.email]],
            password: ['', [ Validators.required, Validators.minLength(3) ]],
        });
    }

    ngOnInit() {
        const login = localStorage.getItem('login');
        const password = localStorage.getItem('password');
        if (login !== null || password !== null) {
            this.formAuth.patchValue({
                login : login,
                password : password,
            });

            localStorage.removeItem('login');
            localStorage.removeItem('password');
        }
    }

    submitLogin() {
        if (this.formAuth.invalid) {
            return;
        }

        this.isSync = true;
        this.isIncorrect = false;
        this.formAuth.disable();
        this.profileService.login(this.formAuth.controls.login.value, this.formAuth.controls.password.value).pipe(
            finalize(() => {
                this.formAuth.enable();
            })
        ).subscribe(() => {
            this.router.navigate(['/service']);
        }, () => {
            this.isIncorrect = true;
            this.profileService.exit();
        });
    }
}
