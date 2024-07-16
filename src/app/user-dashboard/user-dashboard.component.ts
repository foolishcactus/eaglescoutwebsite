import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import {DialogService, DynamicDialogRef, DynamicDialogModule} from 'primeng/dynamicdialog';
import { FirebaseService } from '../firebase.service';
import { PostcreatorComponent } from '../postcreator/postcreator.component';
import { Organization } from '../organization';
import { User } from 'firebase/auth';


@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule, PostcreatorComponent],
  providers: [DialogService],
  templateUrl: './user-dashboard.component.html',
  styleUrl: './user-dashboard.component.css'
})
export class UserDashboardComponent {
  ref: DynamicDialogRef | undefined;
  currentOrganization?: any;
  currentUser: User | null;
  
  constructor(public firebaseService: FirebaseService, public dialogService: DialogService){
    this.currentUser = this.firebaseService.getCurrentUser();

    
    
  }

  async ngOnInit(): Promise<void> {
    try {
      if (this.currentUser && this.currentUser.email){
        console.log("this is the current user email" + this.currentUser.email);
        this.currentOrganization = await this.firebaseService.getOrganizationByEmail({email: this.currentUser.email});
        console.log("this is the return value from get organization if it's successful" + JSON.stringify(this.currentOrganization));
      }
      
    } catch (error) {
      console.error('Error fetching organization:', error);
    }
  }

  show(){
    this.ref = this.dialogService.open(PostcreatorComponent, {});

    this.ref.onClose.subscribe((data: any) => {
      console.log("This is the data" + JSON.stringify(data));
      //this.messageService.add({ severity: 'info', ...summary_and_detail, life: 3000 });
  });
  }

  logout(){
    this.firebaseService.logout();
  }


  addOrganization(){
    let organization: Organization = {
      street: "1600 fargo",
      zipcode: 72453,
      state: "Oklahoma",
      city: "Tulsa",
      description: "We love to help farmers",
      email: "jackfrancicso0000@gmail.com",
      isVerified: false,
      name: "FarmersToHands"
    }

   this.firebaseService.addOrganization(organization)
   .then((messgage) =>{
    console.log("Adding organization was success here is the return:" + JSON.stringify(messgage))})
    .catch((error:any) =>{
      console.log("We cannot get this thing to work")
    });
   
  }

  async getOrganizationByEmail(){
    console.log("We are running get org by email")
    console.log("This is the current user" + JSON.stringify(this.currentUser));
    console.log("This is the current user email" + JSON.stringify(this.currentUser?.email));
    try {
      if (this.currentUser && this.currentUser.email){
        console.log("this is the current user email" + this.currentUser.email);
        let currentOrganization = await this.firebaseService.getOrganizationByEmail({email: this.currentUser.email});
        console.log("this is the return value from get organization if it's successful" + JSON.stringify(currentOrganization));
      }
      
    } catch (error) {
      console.error('Error fetching organization:', error);
    }
    
  }

}
