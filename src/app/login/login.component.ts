import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';

import { ButtonModule } from 'primeng/button';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { CarouselModule } from 'primeng/carousel';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { MessagesModule } from 'primeng/messages';
import { MessageService } from 'primeng/api';

import { FirebaseService } from '../firebase.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IconFieldModule,
    ToastModule,
    MessagesModule,
    InputIconModule,
    InputTextModule,
    ButtonModule,
    InputGroupAddonModule,
    InputGroupModule,
    CarouselModule,
  ],
  providers: [MessageService],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  emailForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private fireBaseService: FirebaseService,
    private router: Router,
    private messageService: MessageService,
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
          this.messageService.add({
            severity: 'error',
            summary: 'Login Failed',
            detail: 'Try Again',
          });
        });
    } else {
      console.log('Invalid Form');
    }
  }
}
