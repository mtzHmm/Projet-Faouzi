import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

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
  errorMessage: string = '';

  // Address fields (matching database structure)
  rue: string = '';           // street
  ville: string = '';         // city
  code_postal: string = '';   // postal code
  complement: string = '';    // additional info

  // Provider specific fields
  storeName: string = '';
  storeCategory: string = '';
  storeCategories = ['restaurant', 'pharmacie', 'courses', 'boutique'];
  
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

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  onSubmit() {
    this.errorMessage = '';
    
    // Validation based on account type
    if (this.accountType === 'provider') {
      if (!this.storeName || !this.storeCategory || !this.rue || !this.ville || !this.code_postal || !this.phone || !this.email || !this.password) {
        this.errorMessage = 'Please fill in all required fields';
        return;
      }
    } else if (this.accountType === 'delivery') {
      if (!this.firstName || !this.lastName || !this.rue || !this.ville || !this.code_postal || !this.city || !this.availabilityTime || !this.phone || !this.email || !this.password) {
        this.errorMessage = 'Please fill in all required fields';
        return;
      }
    } else {
      if (!this.firstName || !this.lastName || !this.rue || !this.ville || !this.code_postal || !this.phone || !this.email || !this.password) {
        this.errorMessage = 'Please fill in all required fields';
        return;
      }
    }

    this.isLoading = true;
    
    // Build comprehensive signup data with proper address structure
    const address = `${this.rue}, ${this.ville} ${this.code_postal}${this.complement ? ', ' + this.complement : ''}`;
    
    const signupData: any = {
      email: this.email,
      password: this.password,
      role: this.accountType === 'delivery' ? 'livreur' : 
            this.accountType === 'provider' ? 'provider' : 'client',
      phone: this.phone,
      address: address,
      rue: this.rue,
      ville: this.ville,
      code_postal: this.code_postal,
      complement: this.complement
    };

    if (this.accountType === 'provider') {
      signupData.storeName = this.storeName;
      signupData.storeCategory = this.storeCategory;
      signupData.name = this.storeName;
    } else {
      signupData.firstName = this.firstName;
      signupData.lastName = this.lastName;
      signupData.name = `${this.firstName} ${this.lastName}`;
      
      if (this.accountType === 'delivery') {
        signupData.city = this.city;
        signupData.availabilityTime = this.availabilityTime;
      }
    }
    
    console.log('📤 Sending registration data:', signupData);
    console.log('🌐 API URL:', this.authService);
    
    this.authService.register(signupData).subscribe({
      next: (response) => {
        this.isLoading = false;
        console.log('✅ Registration response:', response);
        
        if (response.success) {
          const accountTypeText = this.accountType === 'delivery' ? 'Delivery Partner' : 
                                 this.accountType === 'provider' ? 'Store Provider' : 'Customer';
          alert(`${accountTypeText} account created successfully! Please sign in to continue.`);
          this.router.navigate(['/signin']);
        } else {
          this.errorMessage = response.message || 'Registration failed. Please try again.';
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('❌ Registration error:', error);
        console.error('❌ Error status:', error.status);
        console.error('❌ Error details:', error.error);
        
        if (error.status === 0) {
          this.errorMessage = 'Cannot connect to server. Please check if the backend is running.';
        } else if (error.error?.error) {
          this.errorMessage = error.error.error;
        } else if (error.error?.message) {
          this.errorMessage = error.error.message;
        } else if (error.message) {
          this.errorMessage = error.message;
        } else {
          this.errorMessage = 'Registration failed. Please try again.';
        }
      }
    });
  }
}