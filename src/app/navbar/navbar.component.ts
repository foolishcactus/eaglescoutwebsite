import { Component } from '@angular/core';
import { MenubarModule } from 'primeng/menubar';
import { RouterLink } from '@angular/router';
import { Ripple } from 'primeng/ripple';
import { FirebaseService } from '../firebase.service';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { PrimeNGConfig } from 'primeng/api';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, MenubarModule, RouterLink, ButtonModule, Ripple],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent {
  isLoggedIn: boolean;

  constructor(
    private firebaseService: FirebaseService,
    private primengConfig: PrimeNGConfig,
  ) {
    this.isLoggedIn = false;
  }

  ngOnInit() {
    this.primengConfig.ripple = true;
    this.firebaseService.isLoggedIn$().subscribe((loginStatus) => {
      console.log('This is if we are still logged in or not' + loginStatus);
      this.isLoggedIn = loginStatus;
    });
  }
}
