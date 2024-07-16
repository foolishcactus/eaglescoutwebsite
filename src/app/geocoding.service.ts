import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GeocodingService {
  private apiKey = 'AIzaSyCKgIvWgmavJS4CpQwP_i3GmkUgzXkZgEo'; // Replace with your API key
  private geocodeUrl = 'https://maps.googleapis.com/maps/api/geocode/json';

  constructor(private http: HttpClient) {}

  async getCoordinates(zipCode: string): Promise<any> {
    try {
      const url = `${this.geocodeUrl}?address=${zipCode}&key=${this.apiKey}`;
      console.log("This is the url " + url);
      const response = await lastValueFrom(this.http.get<any>(url));
      console.log("This is the response in the service: " + JSON.stringify(response));
      return response;
    } catch (error) {
      console.error('Error in getCoordinates:', error);
      throw error; // Re-throw the error to be caught in the component
    }
  }
}
