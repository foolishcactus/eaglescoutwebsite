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

import { ToastModule } from 'primeng/toast';
import { MessagesModule } from 'primeng/messages';
import { MessageService } from 'primeng/api';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';

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
    ToastModule,
    MessagesModule,
  ],
  providers: [DialogService, MessageService],
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
  prefilledImages: File[] = [];
  preFillImageUrls: string[] = [];
  imagePreviews: string[] = [];
  imageUrlsMarkedForDatabaseDeletion: string[] = [];

  constructor(
    private fb: FormBuilder,
    private dialogConfig: DynamicDialogConfig,
    private messageService: MessageService,
    private firebaseService: FirebaseService,
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
        this.preFillImageUrls.push(url);
        this.prefilledImages.push(file);
        this.images.push(file);
      }

      this.imagePreviews = images;
      console.log(
        'This is prefilled Images ' + JSON.stringify(this.prefilledImages),
      );
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
    const imageUrl = this.imagePreviews[index];
    this.imagePreviews.splice(index, 1);

    // Remove the corresponding file from the images array
    const fileToDelete = this.images[index];
    this.images.splice(index, 1);

    // If the file is prefilled, also remove from prefilledImages array
    const prefilledIndex = this.prefilledImages.indexOf(fileToDelete);
    if (prefilledIndex !== -1) {
      this.prefilledImages.splice(prefilledIndex, 1);
      this.imageUrlsMarkedForDatabaseDeletion.push(imageUrl);
    }
  }

  onImageUpload(event: any) {
    const file: File = event.files[0];
    console.log('This is the files array.');
    console.log(file);

    if (this.images.length >= 3) {
      this.messageService.add({
        severity: 'error',
        summary: 'Image Upload Failed',
        detail: 'Please enter only 3 images, you hit the limit',
      });
      console.log('Image upload limit hit');
      return;
    }

    if (file) {
      this.images.push(file);
      this.imagePreviews.push(URL.createObjectURL(file));
    }
  }

  submit() {
    if (this.postForm.valid) {
      this.messageService.add({
        severity: 'info',
        summary: 'Submitting Form...',
      });
      console.log('Form is valid');

      this.createPost();
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Form Error',
        detail: 'Please fill out entire form',
      });
    }
    console.log('Trying to submit the form');
  }

  async createPost() {
    const { title, description, category } = this.postForm.value;

    try {
      let imageUrls: string[] = [];

      // Filter out new images (those not in prefilledImages)
      const newImages = this.images.filter(
        (file) => !this.prefilledImages.includes(file),
      );

      if (newImages.length > 0) {
        // Upload new images if there are any
        let newImageUrls = await this.firebaseService.uploadImages(newImages);

        // Remove URLs marked for deletion from preFillImageUrls and delete from storage
        for (let url of this.imageUrlsMarkedForDatabaseDeletion) {
          const index = this.preFillImageUrls.indexOf(url);
          if (index !== -1) {
            this.preFillImageUrls.splice(index, 1);
          }
          await this.firebaseService.deleteImageWithURL(url);
        }

        // Combine prefilled URLs with new URLs
        imageUrls = [...this.preFillImageUrls, ...newImageUrls];
      } else {
        // If no new images, use only pre-filled URLs
        imageUrls = [...this.preFillImageUrls];
      }

      let currentUserEmail = this.firebaseService.getCurrentUser()?.email;
      if (!currentUserEmail) {
        console.error('Cannot find current user email');
        return;
      }

      const post: Post = {
        title,
        description,
        category: category.name,
        images: imageUrls,
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
        this.messageService.add({
          severity: 'success',
          summary: returnVal.message,
        });
      } else {
        this.messageService.add({
          severity: 'error',
          summary: returnVal.message,
        });
      }

      this.postForm.reset();
      this.images = [];
      this.imagePreviews = [];
    } catch (error: any) {
      this.postForm.reset();
      this.images = [];
      this.prefilledImages = [];
      this.imagePreviews = [];

      this.messageService.add({
        severity: 'error',
        summary: 'Could not create post' + error,
      });
    }
  }
}
