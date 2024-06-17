import { Component } from '@angular/core';
import {MenubarModule} from 'primeng/menubar'; 
import { RouterLink } from '@angular/router';
import { RippleModule } from 'primeng/ripple';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [MenubarModule, RouterLink, RippleModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {

  constructor(){
   
  }

  ngOnInit(){
   
  }

}
