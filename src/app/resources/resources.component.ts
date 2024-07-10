import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { PrimeNGConfig } from 'primeng/api'; 
import { Ripple} from 'primeng/ripple';

@Component({
  selector: 'app-resources',
  standalone: true,
  imports: [CommonModule, Ripple],
  templateUrl: './resources.component.html',
  styleUrl: './resources.component.css'
})
export class ResourcesComponent {

  constructor(private primengConfig: PrimeNGConfig) { } 

  ngOnInit() { 
    this.primengConfig.ripple = true; 
} 
}
