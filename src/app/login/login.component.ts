import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { ButtonModule } from 'primeng/button';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { CarouselModule } from 'primeng/carousel';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';

import { ToastService } from '../toast.service';

import { FirebaseService } from '../firebase.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    ButtonModule,
    InputGroupAddonModule,
    InputGroupModule,
    CarouselModule,
    RouterLink,
  ],
  providers: [],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  emailForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private fireBaseService: FirebaseService,
    private router: Router,
    private toastService: ToastService,
  ) {
    this.emailForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(1)]], // Ensuring password has at least one character
    });
  }

  signIn() {
    if (this.emailForm.valid) {
      const { email, password } = this.emailForm.value;

      this.fireBaseService
        .login(email, password)
        .then((result) => {
          console.log('The following user has just logged in' + result.user);

          this.router.navigate(['user-dashboard']);
        })
        .catch((error) => {
          this.emailForm.reset();
          console.error('Login error: ' + error);

          //Present Error Toast
          this.toastService.showError('Login Failed', 'Try Again');
        });
    } else {
      console.log('Invalid Form');
    }
  }
}
