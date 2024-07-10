import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FormGroup, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

import { FirebaseService } from '../firebase.service';

import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { DropdownModule } from 'primeng/dropdown';
import { ImageModule } from 'primeng/image';
import { FileUploadModule } from 'primeng/fileupload';

import { ToastModule } from 'primeng/toast';
import { MessagesModule } from 'primeng/messages';
import { MessageService } from 'primeng/api';
import { Post } from '../post';


@Component({
  selector: 'app-postcreator',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputTextModule, FileUploadModule, ImageModule, InputTextareaModule, DropdownModule, ToastModule, MessagesModule],
  providers: [DialogService, MessageService],
  templateUrl: './postcreator.component.html',
  styleUrl: './postcreator.component.css'
})
export class PostcreatorComponent {

  postForm: FormGroup;
  category: any = [
    {
      name: "Construction",
    },
    {
      name: "Landscaping",
    },
    {
      name: "Renovation",
    },
    {
      name: "Environmental",
    },
    {
      name: "Other",
    },
  ];

  images:File[] = [];
  imagePreviews: string[] = [];
  
  constructor (private fb: FormBuilder, private dialogService: DialogService, private ref: DynamicDialogRef, private messageService: MessageService, private firebaseService: FirebaseService){
    this.postForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(1)]],
      description: ['', [Validators.required, Validators.minLength(1)]],
      category: ['', [Validators.required, Validators.minLength(1)]],

    })

    
  }

  deleteImage(index: number){
    this.images.splice(index, 1);
    this.imagePreviews.splice(index, 1);
    console.log("Deleted image" + index);
  }

  onImageUpload(event:any){
    const file: File = event.files[0];
    console.log("This is the files array.")
    console.log(file)

    if (this.images.length >= 3){
      this.messageService.add({
        severity:'error',
        summary: 'Image Upload Failed',
        detail: 'Please enter only 3 images, you hit the limit'
      });
      console.log("Image upload limit hit")
      return;
    }

    if (file) {
      this.images.push(file);
      this.imagePreviews.push(URL.createObjectURL(file));
    }

  }

  submit(){
    if (this.postForm.valid){
      this.messageService.add({severity:'info', summary: 'Submitting Form...',});
      console.log("Form is valid")
      
      this.createPost()
      .then(() =>{
        this.messageService.add({
          severity:'success',
          summary: 'Post Created',
        });
      })
      .catch((error) => {
        this.messageService.add({
          severity:'error',
          summary: 'Error' + error,
        });
      });
      
    }else{
      this.messageService.add({
        severity:'error',
        summary: 'Form Error',
        detail: 'Please fill out entire form'
      });
    }
    console.log("Trying to submit the form")
  }

  async createPost() {
    const { title, description, category } = this.postForm.value;

    try {
      let imageUrls: string[] = [];

      if (this.images.length) {
       imageUrls = await this.firebaseService.uploadImages(this.images);
      }

      let currentUserEmail = this.firebaseService.getCurrentUser()?.email;
      if (!currentUserEmail){
        console.error("Cannot find current user email");
        return;
      }

      const post: Post = {
        title,
        description,
        category: category.name,
        organizationRef: this.firebaseService.createOrganizationRef(currentUserEmail),
        images: imageUrls,
        createdAt: new Date(),
      };

    await this.firebaseService.createPost(post);
     
    this.postForm.reset();
    this.images = [];
    this.imagePreviews = [];

    } catch (error: any) {
      this.messageService.add({
        severity:'error',
        summary: 'Post Created' + error,
      });
    }
  }
}
