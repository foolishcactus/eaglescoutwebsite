import { Component, Input } from '@angular/core';

import { CardModule } from 'primeng/card';
import { GalleriaModule } from 'primeng/galleria';
import { ChipModule } from 'primeng/chip';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-post',
  standalone: true,
  imports: [CommonModule, ChipModule, GalleriaModule, CardModule, ButtonModule],
  templateUrl: './post.component.html',
  styleUrl: './post.component.css',
})
export class PostComponent {
  @Input() post: any; // Replace `any` with the correct type for your post object
  categoryData = {
    Construction: { icon: 'construction', color: '#ef4957' },
    Renovation: { icon: 'build', color: '#169b9a' },
    Environmental: { icon: 'eco', color: '#a7c957' },
    Landscaping: { icon: 'nature', color: '#f6be23' },
    Other: { icon: 'miscellaneous_services', color: '#fa8739' },
  };

  constructor() {}

  ngOnInit() {}

  getCategoryData(category: string) {
    return (
      this.categoryData[category as keyof typeof this.categoryData] ||
      this.categoryData['Other']
    );
  }
}
