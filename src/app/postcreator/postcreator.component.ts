import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import {
  FormGroup,
  ReactiveFormsModule,
  FormBuilder,
  Validators,
} from '@angular/forms';

import { FirebaseService } from '../firebase.service';

import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { DropdownModule } from 'primeng/dropdown';
import { ImageModule } from 'primeng/image';
import { FileUploadModule } from 'primeng/fileupload';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';

import { ToastService } from '../toast.service';

import { Post } from '../post';
import { FunctionReturnPacket } from '../function-return-packet';

@Component({
  selector: 'app-postcreator',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    ButtonModule,
    FileUploadModule,
    ImageModule,
    InputTextareaModule,
    DropdownModule,
  ],
  providers: [DialogService],
  templateUrl: './postcreator.component.html',
  styleUrl: './postcreator.component.css',
})
export class PostcreatorComponent {
  postForm: FormGroup;
  category: any = [
    {
      name: 'Construction',
    },
    {
      name: 'Landscaping',
    },
    {
      name: 'Renovation',
    },
    {
      name: 'Environmental',
    },
    {
      name: 'Other',
    },
  ];

  images: File[] = [];
  imagesUrls: string[] = [];
  oldImages: File[] = [];
  oldImageUrls: string[] = [];

  urlsMarkedForDatabaseDelete: string[] = [];

  constructor(
    private fb: FormBuilder,
    private dialogConfig: DynamicDialogConfig,
    private firebaseService: FirebaseService,
    private toastService: ToastService,
  ) {
    this.postForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(1)]],
      description: ['', [Validators.required, Validators.minLength(1)]],
      category: ['', [Validators.required, Validators.minLength(1)]],
    });
    console.log(
      'This is the data passed in' + JSON.stringify(this.dialogConfig.data),
    );
  }

  async ngOnInit() {
    this.toastService.showSuccess('Success', 'This is a success message');

    if (this.dialogConfig?.data?.inEditMode) {
      console.log('We are in edit mode.');
      const { title, description, category, images } =
        this.dialogConfig.data.post;

      this.postForm = this.fb.group({
        title: [title, [Validators.required, Validators.minLength(1)]],
        description: [
          description,
          [Validators.required, Validators.minLength(1)],
        ],
        category: [
          { name: category },
          [Validators.required, Validators.minLength(1)],
        ],
      });

      // Convert image URLs to File objects and pre-fill the images array
      for (const url of images) {
        const file = await this.firebaseService.urlToFile(url);
        this.oldImageUrls.push(url);
        this.oldImages.push(file);
        this.imagesUrls.push(url);
        this.images.push(file);
      }

      console.log('This is prefilled Images ' + JSON.stringify(this.images));
    } else {
      this.postForm = this.fb.group({
        title: ['', [Validators.required, Validators.minLength(1)]],
        description: ['', [Validators.required, Validators.minLength(1)]],
        category: ['', [Validators.required, Validators.minLength(1)]],
      });
    }
  }

  deleteImage(index: number) {
    // Remove from imageUrls array
    const imageUrl = this.imagesUrls[index];

    //Find if it is an old image or not
    let oldUrlIndex = this.oldImageUrls.indexOf(imageUrl);
    if (oldUrlIndex !== -1) {
      this.urlsMarkedForDatabaseDelete.push(imageUrl);
    }
    this.imagesUrls.splice(index, 1);
    this.images.splice(index, 1);
  }

  onImageUpload(event: any) {
    const file: File = event.files[0];
    console.log('This is the files array.');
    console.log(file);

    if (this.images.length >= 3) {
      this.toastService.showError(
        'Image Upload Failed.',
        'Please enter only 3 images, you hit the limit.',
      );
      console.log('Image upload limit hit');
      return;
    }

    if (file) {
      this.images.push(file);
      this.imagesUrls.push(URL.createObjectURL(file));
    }
  }

  submit() {
    if (this.postForm.valid) {
      this.toastService.showInfo('Status', 'Submitting Form...');
      this.createPost();
    } else {
      this.toastService.showError('Form Error', 'Please fill out entire form.');
    }
    console.log('Trying to submit the form');
  }

  async createPost() {
    const { title, description, category } = this.postForm.value;
    let updatedUrls: string[] = [];

    try {
      //Deleting from database and updating arrays
      let currentUserEmail = this.firebaseService.getCurrentUser()?.email;
      if (!currentUserEmail) {
        console.error('Cannot find current user email');
        return;
      }

      for (let urlMarkedForDelete of this.urlsMarkedForDatabaseDelete) {
        await this.firebaseService.deleteImageWithURL(urlMarkedForDelete);
        let oldUrlIndex = this.oldImageUrls.indexOf(urlMarkedForDelete);

        this.oldImageUrls.splice(oldUrlIndex, 1);
        this.oldImages.splice(oldUrlIndex, 1);
      }

      // Filter out new images (those not in prefilledImages)
      const newImages = this.images.filter(
        (file) => !this.oldImages.includes(file),
      );

      console.log('This is the new images array ' + JSON.stringify(newImages));

      if (newImages.length > 0) {
        // Upload new images if there are any
        let newImageUrls = await this.firebaseService.uploadImages(newImages);

        // Remove URLs marked for deletion from preFillImageUrls and delete from storage

        // Combine prefilled URLs with new URLs
        updatedUrls = [...this.oldImageUrls, ...newImageUrls];
      } else {
        // If no new images, use only pre-filled URLs
        updatedUrls = [...this.oldImageUrls];
      }

      console.log('This is the updated urls ' + JSON.stringify(updatedUrls));

      const post: Post = {
        title,
        description,
        category: category.name,
        images: updatedUrls,
        createdAt: new Date(),
      };

      let returnVal: FunctionReturnPacket =
        await this.firebaseService.createOrEditPost(
          post,
          currentUserEmail,
          this.dialogConfig?.data?.inEditMode,
          this.dialogConfig?.data?.post.title,
        );

      if (returnVal.wasSuccess) {
        this.toastService.showSuccess('Success', returnVal.message);
      } else {
        this.toastService.showError('Error', returnVal.message);
      }

      this.resetEverything();
    } catch (error: any) {
      this.resetEverything();
      this.toastService.showError('Error', "Couldn't create post.");
    }
  }

  resetEverything() {
    this.postForm.reset();
    this.images = [];
    this.imagesUrls = [];
    this.oldImageUrls = [];
    this.oldImages = [];
  }
}
