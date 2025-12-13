import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css'
})
export class SignupComponent {
  firstName: string = '';
  lastName: string = '';
  email: string = '';
  password: string = '';
  phone: string = '';
  accountType: 'customer' | 'delivery' | 'provider' = 'customer';
  isLoading: boolean = false;

  // Provider specific fields
  storeName: string = '';
  storeCategory: string = '';
  storeCategories = ['restaurant', 'pharmacie', 'courses', 'boutique'];
  
  // Address field for all account types
  address: string = '';
  
  // Delivery partner specific fields
  city: string = '';
  availabilityTime: string = '';
  availabilityOptions = [
    'Morning (6:00 AM - 12:00 PM)',
    'Afternoon (12:00 PM - 6:00 PM)', 
    'Evening (6:00 PM - 12:00 AM)',
    'Night (12:00 AM - 6:00 AM)',
    'Full Day (24/7)'
  ];

  constructor(private router: Router) {}

  onSubmit() {
    // Validation based on account type
    if (this.accountType === 'provider') {
      if (!this.storeName || !this.storeCategory || !this.address || !this.phone || !this.email || !this.password) {
        alert('Please fill in all fields');
        return;
      }
    } else if (this.accountType === 'delivery') {
      if (!this.firstName || !this.lastName || !this.address || !this.city || !this.availabilityTime || !this.phone || !this.email || !this.password) {
        alert('Please fill in all fields');
        return;
      }
    } else {
      if (!this.firstName || !this.lastName || !this.address || !this.phone || !this.email || !this.password) {
        alert('Please fill in all fields');
        return;
      }
    }

    this.isLoading = true;
    
    const signupData: any = {
      email: this.email,
      password: this.password,
      accountType: this.accountType,
      address: this.address,
      phone: this.phone
    };

    if (this.accountType === 'provider') {
      signupData.storeName = this.storeName;
      signupData.storeCategory = this.storeCategory;
    } else {
      signupData.firstName = this.firstName;
      signupData.lastName = this.lastName;
      
      if (this.accountType === 'delivery') {
        signupData.city = this.city;
        signupData.availabilityTime = this.availabilityTime;
      }
    }
    
    console.log('Sign up attempt:', signupData);
    
    // Simulate API call
    setTimeout(() => {
      this.isLoading = false;
      const name = this.accountType === 'provider' ? this.storeName : `${this.firstName} ${this.lastName}`;
      alert(`Account created successfully for ${name}!`);
      // Redirect to signin page
      this.router.navigate(['/signin']);
    }, 1000);
  }
}