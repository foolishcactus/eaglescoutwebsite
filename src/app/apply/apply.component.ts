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
  }

  ngOninit(){
    
  }

  register(){

  if (this.applyForm.valid){

    const organizationData = {
      name: this.applyForm.value.organizationname,
      address: this.applyForm.value.address,
      email: this.applyForm.value.email,
      description: this.applyForm.value.description,
    }

    this.fireBaseService.addOrganization(organizationData).subscribe(
      response =>{
        console.log("Organization addedd successfully: " + response);
      },
      error => {
        console.error('COMPONENT ERRROR IN APPLY COMPONENT' + error);
      }
    )
  }
  }
  
}

