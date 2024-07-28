import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FirebaseService } from '../firebase.service';
import { PostcreatorComponent } from '../postcreator/postcreator.component';
import { User } from 'firebase/auth';
import { ButtonModule } from 'primeng/button';
import { ChipModule } from 'primeng/chip';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { Post } from '../post';
import { ToastService } from '../toast.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    PostcreatorComponent,
    ButtonModule,
    ChipModule,
    OverlayPanelModule,
    ConfirmDialogModule,
  ],
  providers: [DialogService, ConfirmationService],
  templateUrl: './user-dashboard.component.html',
  styleUrl: './user-dashboard.component.css',
})
export class UserDashboardComponent {
  ref: DynamicDialogRef | undefined;
  currentOrganization?: any;
  currentUser: User | null;
  organizationPosts: Post[] = [];
  numOfActivePosts: number = 0;

  testPost = {
    category: 'Construction',
    description: 'We need help building a table',
    images: [
      'https://firebasestorage.googleapis.com/v0/b/eaglescoutwebsite.appspot.com/o/posts%2F1720367418550_table1.jpg?alt=media&token=755b7e38-76f1-49e6-aa6c-9256c171ccec',
      'https://firebasestorage.googleapis.com/v0/b/eaglescoutwebsite.appspot.com/o/posts%2F1720367418551_table2.jpg?alt=media&token=9934c8b0-67c0-47c7-828a-7ef11f88b292',
    ],
    title: 'Build a table',
  };

  categories = [
    { name: 'Construction' },
    { name: 'Renovation' },
    { name: 'Environmental' },
    { name: 'Landscaping' },
    { name: 'Other' },
  ];

  categoryData = {
    Construction: { icon: 'construction', color: '#ef4957' },
    Renovation: { icon: 'build', color: '#169b9a' },
    Environmental: { icon: 'eco', color: '#a7c957' },
    Landscaping: { icon: 'nature', color: '#f6be23' },
    Other: { icon: 'miscellaneous_services', color: '#fa8739' },
  };

  constructor(
    public firebaseService: FirebaseService,
    public dialogService: DialogService,
    private confirmationService: ConfirmationService,
    private toastService: ToastService,
    private router: Router,
  ) {
    this.currentUser = this.firebaseService.getCurrentUser();
  }

  async ngOnInit(): Promise<void> {
    try {
      if (this.currentUser && this.currentUser.email) {
        this.getDataForSignedInOrganization();
        this.getPostsForThisOrganization();
        //this.organizationPosts = this.transformPostImages(this.organizationPosts);
      }
    } catch (error) {
      console.error('Error fetching organization:', error);
    }
  }

  async createPost() {
    this.ref = this.dialogService.open(PostcreatorComponent, {});

    this.ref.onClose.subscribe((result) => {
      // Refresh the component or perform necessary actions
      this.getDataForSignedInOrganization();
      this.getPostsForThisOrganization();
    });
  }

  async editPost(postToEdit: Post) {
    this.ref = this.dialogService.open(PostcreatorComponent, {
      data: {
        post: postToEdit,
        inEditMode: true,
      },
    });

    this.ref.onClose.subscribe((result) => {
      // Refresh the component or perform necessary actions
      this.getPostsForThisOrganization();
    });
  }

  logout() {
    this.firebaseService.logout();
    this.router.navigate(['/']);
  }

  async getDataForSignedInOrganization() {
    try {
      if (this.currentUser && this.currentUser.email) {
        this.currentOrganization =
          await this.firebaseService.getOrganizationByEmail({
            email: this.currentUser.email,
          });

        this.numOfActivePosts = this.currentOrganization.numOfActivePosts;
        console.log(
          'This is the number of active posts being intialized: ' +
            this.numOfActivePosts,
        );
      }
    } catch (error) {
      console.error('Error fetching organization:', error);
    }
  }

  //transformPostImages(posts: any[]): any[] {
  //  console.log("We are in the transform function");
  //  posts.forEach(post => {
  //    console.log("In the forEach loop");
  //    if (post.images && post.images.length > 0) {
  //      post.images = post.images.map((url: string) => ({ urlProperty: url }));
  //    } else {
  //      post.images = [];
  //    }
  //  });
  //  // Assign the transformed posts to the component's posts property
  //  return posts;
  //}

  async confirmDelete(event: Event, post: any) {
    console.log('This thing is firing');

    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'Do you want to delete this post?',
      header: 'Delete Confirmation',
      icon: 'pi pi-info-circle',
      acceptButtonStyleClass: 'p-button-danger p-button-text',
      rejectButtonStyleClass: 'p-button-text p-button-text',
      acceptIcon: 'none',
      rejectIcon: 'none',

      accept: () => {
        this.toastService.showSuccess('Success', 'Post Deleted');
        this.deletePost(post);
      },
      reject: () => {
        this.toastService.showError('Error', 'Cancelled');
      },
    });
  }

  async getPostsForThisOrganization() {
    this.organizationPosts =
      await this.firebaseService.getPostsFromOrganization({
        email: this.currentUser?.email,
      });
  }

  async deletePost(postToDelete: Post) {
    console.log('We are deleting a document.');
    let deleteFromFirebaseIsSuccessful: boolean =
      await this.firebaseService.deletePost(postToDelete);

    for (let url of postToDelete.images) {
      await this.firebaseService.deleteImageWithURL(url);
    }

    if (!deleteFromFirebaseIsSuccessful) {
      this.toastService.showError('Error', 'Could not delete on our server');
      return;
    }

    //Update the UI so we don't reload the component and pull from server
    for (let i = 0; i < this.organizationPosts.length; i++) {
      if (
        JSON.stringify(this.organizationPosts[i].images) ===
        JSON.stringify(postToDelete.images)
      ) {
        console.log(
          'We are removing this post: ' +
            JSON.stringify(this.organizationPosts[i]),
        );
        this.organizationPosts.splice(i, 1);
      }
    }

    this.numOfActivePosts -= 1;

    console.log(
      'This is the numOfActive Posts now after deleting' +
        this.numOfActivePosts,
    );

    console.error(
      "Couldn't find post we wanted to delete in the organization posts array. Weird",
    );
    return;
  }

  getCategoryData(category: string) {
    return (
      this.categoryData[category as keyof typeof this.categoryData] ||
      this.categoryData['Other']
    );
  }
}
