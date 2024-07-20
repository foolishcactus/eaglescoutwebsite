import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { Router } from '@angular/router';
import { FirebaseService } from '../firebase.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  isAuthenticated = false;
  buttonLabel = 'Apply Now';

  constructor(
    private router: Router,
    private firebaseService: FirebaseService,
  ) {}

  ngOnInit(): void {
    this.firebaseService.currentUser.subscribe((user) => {
      this.isAuthenticated = !!user;
    });

    this.buttonLabel = this.isAuthenticated ? 'Go to Dashboard' : 'Apply Now';
  }

  findProjectsClick() {
    this.router.navigate(['/projectfinder']);
  }

  applyOrDashboardClick() {
    if (this.isAuthenticated) {
      this.router.navigate(['/user-dashboard']); // Adjust with the actual route for the user dashboard
    } else {
      this.router.navigate(['/apply']); // Adjust with the actual route for applying
    }
  }
}
