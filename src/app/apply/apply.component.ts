import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import { RouterModule } from '@angular/router';

import { InputTextareaModule } from 'primeng/inputtextarea';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessagesModule } from 'primeng/messages';
import { MessageService } from 'primeng/api';


import { FirebaseService } from '../firebase.service';

@Component({
  selector: 'app-apply',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, ToastModule, MessagesModule, ButtonModule, IconFieldModule, InputIconModule, InputTextModule, InputTextareaModule],
  providers: [MessageService],
  templateUrl: './apply.component.html',
  styleUrl: './apply.component.css'
})
export class ApplyComponent {

  applyForm: FormGroup;

  constructor(private fb: FormBuilder, private fireBaseService: FirebaseService, private messageService: MessageService){
    this.applyForm = this.fb.group({
      organizationname: ['', [Validators.required, Validators.minLength(1)]],
      address: ['', [Validators.required, Validators.minLength(1)]],
      email: ['', [Validators.required, Validators.email]],
      description: ['', [Validators.required, Validators.minLength(1)]],
      
    })

    this.applyForm.statusChanges.subscribe((status:any) => {
      if (status === 'VALID') {
        console.log('Form is valid');
      } else if (status === 'INVALID') {
        console.log('Form is invalid');
      }
    });
  }

  ngOninit(){
    
  }

  register(){
    if(this.applyForm.valid){

      const organizationData = {
        name: this.applyForm.value.organizationname,
        address: this.applyForm.value.address,
        email: this.applyForm.value.email,
        description: this.applyForm.value.description,
        isVerified: false,
      }

      this.fireBaseService.registerOrganization(this.applyForm.value.email , 'Password123').then(() => {
        console.log('Registration successful and verification email sent.')
        this.fireBaseService.addOrganization(organizationData, organizationData.email);
        this.messageService.add({severity:'success', summary: 'Success', detail: 'Form submission is successful. Please check your email for a confirmation email.'});
      }).catch((error) =>{
        console.error('Registration failed:', error)

        if (error.code === 'auth/email-already-in-use') {
          this.messageService.add({
            severity:'error',
            summary: 'Registration Failed',
            detail: 'The email address is already in use.'
          });
        }

      
      });
    
      this.applyForm.reset();
    }else{
      this.applyForm.reset();
      this.messageService.add({severity:'error', summary: 'Error', detail: 'Form submission is unsuccessful. Please try again.'});
    }
  }
  
}

