import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { FirebaseService } from '../firebase.service';
import { ToastService } from '../toast.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-passwordreset',
  standalone: true,
  imports: [
    FloatLabelModule,
    InputTextModule,
    CommonModule,
    FormsModule,
    ButtonModule,
  ],
  templateUrl: './passwordreset.component.html',
  styleUrl: './passwordreset.component.css',
})
export class PasswordresetComponent {
  value: string | undefined = undefined;
  isSubmitted: boolean = false;

  constructor(
    private firebaseService: FirebaseService,
    private toastService: ToastService,
    private router: Router,
  ) {}

  submit() {
    if (this.value) {
      this.firebaseService.sendPasswordReset(this.value);
      this.isSubmitted = true;
      setTimeout(() => {
        this.router.navigate(['login']);
      }, 4000);
    } else {
      this.toastService.showError('Error', 'No email was provided.');
    }
  }
}
