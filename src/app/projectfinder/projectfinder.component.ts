import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CardModule } from 'primeng/card';
import { GalleriaModule } from 'primeng/galleria';
import { ButtonModule } from 'primeng/button';
import { ChipModule } from 'primeng/chip';
import { SliderModule } from 'primeng/slider';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { InputMaskModule } from 'primeng/inputmask';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';

import { FirebaseService } from '../firebase.service';
import { Post } from '../post';
import {
  FormGroup,
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  FormsModule,
} from '@angular/forms';
import { GeocodingService } from '../geocoding.service';

@Component({
  selector: 'app-projectfinder',
  standalone: true,
  imports: [
    CardModule,
    CommonModule,
    SliderModule,
    IconFieldModule,
    InputIconModule,
    InputMaskModule,
    FormsModule,
    GalleriaModule,
    MultiSelectModule,
    InputTextModule,
    ButtonModule,
    ChipModule,
    ReactiveFormsModule,
  ],
  templateUrl: './projectfinder.component.html',
  styleUrl: './projectfinder.component.css',
})
export class ProjectfinderComponent {
  posts: Post[][] = [];
  value: number = 50;

  categories = [
    { name: 'Construction' },
    { name: 'Renovation' },
    { name: 'Environmental' },
    { name: 'Landscaping' },
    { name: 'Other' },
  ];

  categoryData = {
    Construction: { icon: 'construction', color: '#ef4957' },
    Renovation: { icon: 'build', color: '#169b9a' },
    Environmental: { icon: 'eco', color: '#a7c957' },
    Landscaping: { icon: 'nature', color: '#f6be23' },
    Other: { icon: 'miscellaneous_services', color: '#fa8739' },
  };

  filterForm: FormGroup;

  constructor(
    private firebaseService: FirebaseService,
    private fb: FormBuilder,
    private geocodingService: GeocodingService,
  ) {
    this.filterForm = this.fb.group({
      name: [''],
      category: [''],
      zipcode: ['', [Validators.required, Validators.pattern('^[0-9]{5}$')]],
      radius: [5],
    });
  }

  ngOnInit() {
    this.loadPosts(true);
  }

  async loadPosts(isOnInit?: boolean) {
    this.posts = [];
    let tempPosts: any[] = [];
    let tempContainer: any[] = [];
    let i = 0;

    try {
      if (isOnInit) {
        tempPosts = await this.firebaseService.getAllPosts();
      } else {
        tempPosts = await this.filterSearch();
      }

      tempPosts = this.transformPostImages(tempPosts);
      for (i = 0; i < tempPosts.length; i++) {
        //Add groups of 3 posts to this.posts
        if (i % 2 == 0 && i != 0) {
          this.posts.push(tempContainer);
          tempContainer = [];
        }
        tempContainer.push(tempPosts[i]);
      }

      // Add any remaining items in tempContainer to this.posts
      if (tempContainer.length > 0) {
        this.posts.push(tempContainer);
      }
    } catch (error) {
      console.log('Error getting posts' + error);
    }
  }

  getCategoryData(category: string) {
    return (
      this.categoryData[category as keyof typeof this.categoryData] ||
      this.categoryData['Other']
    );
  }

  async filterSearch(): Promise<any[]> {
    if (!this.filterForm.valid) {
      throw new Error("The filter form isn't valid");
    }

    let zipCodeString: string = this.filterForm
      .get('zipcode')
      ?.value.toString();
    let response = await this.geocodingService.getCoordinates(zipCodeString);

    const filtersObject = {
      name: this.filterForm.get('name')?.value,
      category: this.filterForm.get('category')?.value,
      zipcode: this.filterForm.get('zipcode')?.value,
      radius: this.filterForm.get('radius')?.value,
      lat: response.results[0].geometry.location.lat || null,
      long: response.results[0].geometry.location.lng || null,
    };

    console.log('this is the filters object' + JSON.stringify(filtersObject));
    return await this.firebaseService.getFilteredPosts(filtersObject);
  }

  //Transforming Images array into an array of objects that have a property of urlProperty with the originial string to fit the constraints of PRIME NG galleria template
  transformPostImages(posts: any[]): any[] {
    posts.forEach((post) => {
      if (post.images && post.images.length > 0) {
        post.images = post.images.map((url: string) => ({ urlProperty: url }));
      } else {
        post.images = [];
      }
    });
    // Assign the transformed posts to the component's posts property
    return posts;
  }

  onResetFilter() {
    this.filterForm.reset();
    this.filterForm.get('radius')?.setValue(5);
  }

  //function used for html template
  get radius() {
    const control = this.filterForm.get('radius');
    return control ? control.value : 0;
  }
}
