import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {DialogService, DynamicDialogRef} from 'primeng/dynamicdialog';
import { FirebaseService } from '../firebase.service';
import { PostcreatorComponent } from '../postcreator/postcreator.component';
import { Organization } from '../organization';
import { User } from 'firebase/auth';
import { ButtonModule } from 'primeng/button';
import { ChipModule } from 'primeng/chip';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule, PostcreatorComponent, ButtonModule, ChipModule, OverlayPanelModule, ConfirmDialogModule, ToastModule],
  providers: [DialogService, ConfirmationService, MessageService],
  templateUrl: './user-dashboard.component.html',
  styleUrl: './user-dashboard.component.css'
})
export class UserDashboardComponent {
  ref: DynamicDialogRef | undefined;
  currentOrganization?: any;
  currentUser: User | null;
  organizationPosts: any[] = [];

  categories = [{name: "Construction"}, {name: "Renovation"}, {name: "Environmental"}, {name: "Landscaping"}, {name: "Other"}]
  
  categoryData = {
    Construction: { icon: 'construction', color: '#ef4957' },
    Renovation: { icon: 'build', color: '#169b9a' },
    Environmental: { icon: 'eco', color: '#a7c957' },
    Landscaping: { icon: 'nature', color: '#f6be23' },
    Other: { icon: 'miscellaneous_services', color: '#fa8739' }
  };
  
  constructor(public firebaseService: FirebaseService, public dialogService: DialogService, private confirmationService: ConfirmationService, private messageService: MessageService){
    this.currentUser = this.firebaseService.getCurrentUser();

    
    
  }

  async ngOnInit(): Promise<void> {
    try {
      if (this.currentUser && this.currentUser.email){
        console.log("this is the current user email" + this.currentUser.email);
        this.currentOrganization = await this.firebaseService.getOrganizationByEmail({email: this.currentUser.email});
        this.organizationPosts = await this.firebaseService.getPostsFromOrganization({email: this.currentUser.email});
        this.organizationPosts = this.transformPostImages(this.organizationPosts);
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

  transformPostImages(posts: any[]): any[] {
    console.log("We are in the transform function");
    posts.forEach(post => {
      console.log("In the forEach loop");
      if (post.images && post.images.length > 0) {
        post.images = post.images.map((url: string) => ({ urlProperty: url }));
      } else {
        post.images = [];
      }
    });
    // Assign the transformed posts to the component's posts property
    return posts;
  }

  async confirmDelete(event: Event, post: any) {
    console.log("This thing is firing");

    this.confirmationService.confirm({
        target: event.target as EventTarget,
        message: 'Do you want to delete this post?',
        header: 'Delete Confirmation',
        icon: 'pi pi-info-circle',
        acceptButtonStyleClass:"p-button-danger p-button-text",
        rejectButtonStyleClass:"p-button-text p-button-text",
        acceptIcon:"none",
        rejectIcon:"none",

        accept: () => {
            this.messageService.add({ severity: 'info', summary: 'Confirmed', detail: 'Record deleted' });
            
            this.deletePost(post);
        },
        reject: () => {
            this.messageService.add({ severity: 'error', summary: 'Rejected', detail: 'Cancelled' });
        }
    });
}

//Deletes the post from the local array to create the UI change
async deletePost(postToDelete: any){

  
  let deleteFromFirebaseIsSuccessful: boolean = await this.firebaseService.deletePost(postToDelete);

  if (!deleteFromFirebaseIsSuccessful){
    this.messageService.add({ severity: 'error', summary: 'Server Error', detail: 'Could not delete on our server' });
    return;
  }

  for (let i = 0; i < this.organizationPosts.length; i++){
    if (JSON.stringify(this.organizationPosts[i].images) === JSON.stringify(postToDelete.images)){
      console.log("We are removing this post: " + JSON.stringify(this.organizationPosts[i]));
      this.organizationPosts.splice(i, 1);
      return;
    }
  }

  console.error("Couldn't find post we wanted to delete in the organization posts array. Weird");
  return;
}

  getCategoryData(category: string) {
    return this.categoryData[category as keyof typeof this.categoryData] || this.categoryData['Other'];
  }

  

}
