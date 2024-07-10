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
  currentOrganization?: Organization;
  currentUser: User | null;
  
  constructor(public firebaseService: FirebaseService, public dialogService: DialogService){
    this.currentUser = this.firebaseService.getCurrentUser();

    
    
  }

  async ngOnInit(): Promise<void> {
    try {
      if (this.currentUser && this.currentUser.email){
        console.log("this is the current user email" + this.currentUser.email);
        this.currentOrganization = await this.firebaseService.getOrganizationByEmail(this.currentUser.email);
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

}
