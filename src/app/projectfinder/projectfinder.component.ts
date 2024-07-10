import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CardModule } from 'primeng/card';
import { GalleriaModule } from 'primeng/galleria';
import { ButtonModule } from 'primeng/button';
import { ChipModule } from 'primeng/chip';

import { FirebaseService } from '../firebase.service';
import { Post } from '../post';

@Component({
  selector: 'app-projectfinder',
  standalone: true,
  imports: [CardModule, CommonModule, GalleriaModule, ButtonModule, ChipModule],
  templateUrl: './projectfinder.component.html',
  styleUrl: './projectfinder.component.css'
})
export class ProjectfinderComponent {
  posts: Post[][] = [

  ];

  categoryData = {
    Construction: { icon: 'construction', color: '#ef4957' },
    Renovation: { icon: 'build', color: '#169b9a' },
    Environmental: { icon: 'eco', color: '#a7c957' },
    Landscaping: { icon: 'nature', color: '#f6be23' },
    Other: { icon: 'miscellaneous_services', color: '#fa8739' }
  };

  testPost: Post = {
    "description": "We need help building a sign post",
    "images": [
      {
        "urlProperty": "https://firebasestorage.googleapis.com/v0/b/eaglescoutwebsite.appspot.com/o/posts%2Fsignpost.jpg?alt=media&token=cd280644-3d60-4566-b63a-dcb696de43f9"
      },
      {
        "urlProperty": "https://firebasestorage.googleapis.com/v0/b/eaglescoutwebsite.appspot.com/o/posts%2Fsignpost2.jpg?alt=media&token=a9a5d751-bdf8-474a-8b3b-1a38f9379031"
      }
    ],
    "organizationRef": this.firebaseService.createOrganizationRef("strikerchannele@gmail.com"),
    "category": "Construction",
    "title": "Build a sign post",
    "createdAt": new Date(),
    "organization": {
      "description": "We help businesses",
      "email": "strikerchannele@gmail.com",
      "isVerified": true,
      "name": "Striker Non Profit",
      "street": "7059 Monterey Cypress TR",
      "zipcode": 32773,
      "state": "FL",
      "city": "Sanford",
    }
  }

  constructor(private firebaseService: FirebaseService){

  }

  ngOnInit(){
    this.loadPosts();
    this.posts.forEach((row: any) =>{
      row.forEach((post: any) =>{
        console.log("This is the post" + post);
      })
    });   
  }

  async loadPosts() {
    let tempPosts = [];
    let tempContainer: any[] = [];
    let i = 0;

    try {
      tempPosts = await this.firebaseService.getPostsWithOrganizations();
      console.log("This is how many posts we have in the database:" + tempPosts.length);

      for (i = 0; i < tempPosts.length; i++){
        //Add groups of 3 posts to this.posts
        if (i % 3 == 0 && i != 0){
          this.posts.push(tempContainer);
          console.log("This is the tempContainer which is going to be a row." + JSON.stringify(tempContainer));
          tempContainer = [];
        }
        tempContainer.push(tempPosts[i]);
      }

      // Add any remaining items in tempContainer to this.posts
      if (tempContainer.length > 0){
        console.log("We have these things remaining in tempContainer" + JSON.stringify(tempContainer));
        this.posts.push(tempContainer);
      }
      console.log("This is the value of posts by the end");
      console.log(JSON.stringify(this.posts));
    } catch (error) {
      console.log("Error getting posts" + error);
    }
  }

  getCategoryData(category: string) {
    return this.categoryData[category as keyof typeof this.categoryData] || this.categoryData['Other'];
  }
}
