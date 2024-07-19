import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RouterModule } from '@angular/router';

import { InputTextareaModule } from 'primeng/inputtextarea';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { InputMaskModule } from 'primeng/inputmask';

import { FirebaseService } from '../firebase.service';
import { Organization } from '../organization';

@Component({
  selector: 'app-apply',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    ButtonModule,
    IconFieldModule,
    InputMaskModule,
    InputIconModule,
    InputTextModule,
    InputTextareaModule,
    DropdownModule,
  ],
  providers: [],
  templateUrl: './apply.component.html',
  styleUrl: './apply.component.css',
})
export class ApplyComponent {
  applyForm: FormGroup;
  states = [
    'AL',
    'AK',
    'AZ',
    'AR',
    'CA',
    'CO',
    'CT',
    'DE',
    'FL',
    'GA',
    'HI',
    'ID',
    'IL',
    'IN',
    'IA',
    'KS',
    'KY',
    'LA',
    'ME',
    'MD',
    'MA',
    'MI',
    'MN',
    'MS',
    'MO',
    'MT',
    'NE',
    'NV',
    'NH',
    'NJ',
    'NM',
    'NY',
    'NC',
    'ND',
    'OH',
    'OK',
    'OR',
    'PA',
    'RI',
    'SC',
    'SD',
    'TN',
    'TX',
    'UT',
    'VT',
    'VA',
    'WA',
    'WV',
    'WI',
    'WY',
  ];

  constructor(
    private fb: FormBuilder,
    private fireBaseService: FirebaseService,
  ) {
    console.log(this.states.length);
    this.applyForm = this.fb.group({
      organizationname: ['', [Validators.required, Validators.minLength(1)]],
      street: ['', [Validators.required, Validators.minLength(1)]],
      city: ['', [Validators.required, Validators.minLength(1)]],
      state: ['', [Validators.required, Validators.minLength(1)]],
      zipcode: ['', [Validators.required, Validators.pattern('^[0-9]{5}$')]],
      email: ['', [Validators.required, Validators.email]],
      description: ['', [Validators.required, Validators.minLength(1)]],
    });
  }

  ngOninit() {}

  register() {
    if (this.applyForm.valid) {
      const organizationData: Organization = {
        name: this.applyForm.value.organizationname,
        street: this.applyForm.value.street,
        zipcode: this.applyForm.value.zipcode,
        state: this.applyForm.value.state,
        city: this.applyForm.value.city,
        email: this.applyForm.value.email,
        isVerified: false,
        description: this.applyForm.value.description,
      };

      this.fireBaseService
        .addOrganization(organizationData)
        .then((messgage) => {
          console.log(
            'Adding organization was success here is the return:' +
              JSON.stringify(messgage),
          );
        })
        .catch((error: any) => {
          console.log('We cannot get this thing to work');
        });
    }
  }
}
