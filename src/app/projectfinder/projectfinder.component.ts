import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { SliderModule } from 'primeng/slider';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { InputMaskModule } from 'primeng/inputmask';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';

import { FirebaseService } from '../firebase.service';
import { Post } from '../post';
import { PostComponent } from '../post/post.component';
import { ChunkPipe } from '../chunk.pipe';
import { ToastService } from '../toast.service';

import { InfiniteScrollDirective } from 'ngx-infinite-scroll';

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
    MultiSelectModule,
    InputTextModule,
    ButtonModule,
    ReactiveFormsModule,
    PostComponent,
    InfiniteScrollDirective,
    ChunkPipe,
  ],
  templateUrl: './projectfinder.component.html',
  styleUrl: './projectfinder.component.css',
})
export class ProjectfinderComponent {
  posts: Post[] = [];
  loading: boolean = false;
  limit: number = 4;
  lastVisible: string | undefined = undefined;
  filterCriteria: any = {};
  filterForm: FormGroup;
  filtersHaveBeenActivated: boolean = false;
  numberOfTimeFilterSearch: number = 0;

  categories = [
    { name: 'Construction' },
    { name: 'Renovation' },
    { name: 'Environmental' },
    { name: 'Landscaping' },
    { name: 'Other' },
  ];

  constructor(
    private firebaseService: FirebaseService,
    private fb: FormBuilder,
    private geocodingService: GeocodingService,
    private toastService: ToastService,
  ) {
    this.filterForm = this.fb.group({
      category: ['', [Validators.required]],
      zipcode: ['', [Validators.required, Validators.pattern('^[0-9]{5}$')]],
      radius: [5, [Validators.required]],
    });
  }

  ngOnInit() {
    this.loadPosts();
  }

  async loadPosts(withFilters?: boolean) {
    let tempPosts: Post[] = [];

    try {
      if (this.filtersHaveBeenActivated || withFilters) {
        console.log('THE FILTERS HAVE BEEN ACTIVATED');
        let returnVal = await this.filterSearch();
        tempPosts = returnVal.data;
      } else {
        let returnVal = await this.firebaseService.getPostsWithPagination(
          this.limit,
          this.lastVisible,
        );
        tempPosts = returnVal.data;
      }

      console.log('This is the tempPosts value ' + JSON.stringify(tempPosts));

      if (tempPosts.length > 0) {
        const transformedPosts = this.transformPostImages(tempPosts);

        // Add the new posts to the existing posts array
        this.posts = [...this.posts, ...transformedPosts];

        // Update lastVisible for pagination
        this.lastVisible = transformedPosts[transformedPosts.length - 1].id;
      }

      console.log('This is the posts array: ' + JSON.stringify(this.posts));
    } catch (error) {
      console.log('Error getting posts: ' + error);
    } finally {
      console.log('This is the posts array: ' + JSON.stringify(this.posts));
    }
  }

  async filterSearch() {
    if (!this.filterForm.valid) {
      if (this.filterForm.get('category')?.value === null) {
        this.toastService.showWarn(
          "Filter Isn't Valid",
          'Please specify categories.',
        );
      } else if (this.filterForm.get('zipcode')?.value === null) {
        this.toastService.showWarn(
          "Filter Isn't Valid",
          'Please specify zipcode.',
        );
      }
    }

    const newFilterCriteria = {
      name: this.filterForm.get('name')?.value,
      category: this.filterForm.get('category')?.value,
      zipcode: this.filterForm.get('zipcode')?.value,
      radius: this.filterForm.get('radius')?.value,
      lat: null,
      long: null,
    };

    // Get the new lat/long values based on the zipcode
    if (newFilterCriteria.zipcode) {
      let response = await this.geocodingService.getCoordinates(
        newFilterCriteria.zipcode,
      );
      newFilterCriteria.lat = response.results[0].geometry.location.lat || null;
      newFilterCriteria.long =
        response.results[0].geometry.location.lng || null;
    }

    // Compare new filter criteria with current filter criteria
    if (
      JSON.stringify(newFilterCriteria) !== JSON.stringify(this.filterCriteria)
    ) {
      // Filter criteria have changed, reset posts and pagination
      this.posts = [];
      this.lastVisible = undefined;
      this.filterCriteria = newFilterCriteria;
    }

    this.filtersHaveBeenActivated = true;
    this.numberOfTimeFilterSearch += 1;

    console.log(
      'this is the filters object' + JSON.stringify(this.filterCriteria),
    );
    return await this.firebaseService.getPostsWithPagination(
      this.limit,
      this.lastVisible,
      this.filterCriteria,
    );
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
