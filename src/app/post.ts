import { Organization } from './organization';
import { DocumentReference, FieldValue } from '@angular/fire/firestore';

export interface Post {
  id?: string;
  category: string;
  description: string;
  images: any[];
  title: string;
  organizationRef?: DocumentReference<any>;
  //organization property will only populate once its retrieved from the fire store
  organization?: Organization;
  createdAt?: Date | FieldValue;
}
