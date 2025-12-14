import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css'
})
export class SignupComponent {
  // Common fields for all account types
  firstName: string = '';        // prenom in DB
  lastName: string = '';         // nom in DB
  email: string = '';
  password: string = '';
  phone: string = '';            // tel in DB
  accountType: 'customer' | 'delivery' | 'provider' = 'customer';
  isLoading: boolean = false;
  errorMessage: string = '';

  // Location fields (matching actual DB structure)
  ville: string = '';            // ville_client/ville_livraison/ville_magasin
  gouvernorat: string = '';      // gouv_client/gouv_livreur/gouv_magasin

  // Provider/Store specific fields (magasin table)
  storeName: string = '';        // nom in magasin table
  storeType: string = '';        // type in magasin table
  storeTypes = ['restaurant', 'pharmacie', 'boutique', 'courses'];
  
  // Delivery partner specific fields (livreur table)
  vehicule: string = '';         // vehicule in livreur table
  ville_livraison: string = ''; // ville_livraison in livreur table
  disponibilite: string = '';   // disponibilite in livreur table
  
  vehiculeOptions = ['Scooter', 'Moto', 'Voiture', 'Vélo'];
  disponibiliteOptions = [
    '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
    '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
    '18:00', '19:00', '20:00', '21:00', '22:00'
  ];

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  onSubmit() {
    console.log('🔵 Form submitted!');
    this.errorMessage = '';
    
    // Basic validation for different account types
    if (this.accountType === 'provider') {
      // Providers (magasin table) only need: nom, email, password (tel, type, gouvernorat, ville are optional)
      if (!this.storeName || !this.email || !this.password) {
        this.errorMessage = 'Please fill in all required fields (Store Name, Email, Password)';
        return;
      }
    } else {
      // Clients and livreurs need: nom, prenom, email, password (tel, gouvernorat, ville are optional)
      if (!this.firstName || !this.lastName || !this.email || !this.password) {
        this.errorMessage = 'Please fill in all required fields (First Name, Last Name, Email, Password)';
        return;
      }
    }

    this.isLoading = true;
    
    // Build signup data matching backend API expectations
    const signupData: any = {
      email: this.email,
      password: this.password,
      phone: this.phone || null,
      role: this.accountType === 'customer' ? 'client' : this.accountType === 'delivery' ? 'livreur' : 'provider'
    };

    // Add fields based on account type matching backend expectations
    if (this.accountType === 'provider') {
      // magasin table fields - backend expects name or storeName and storeCategory
      signupData.name = this.storeName;
      signupData.storeName = this.storeName;
      signupData.storeCategory = this.storeType || 'restaurant';
      signupData.ville = this.ville || null;
      signupData.complement = this.gouvernorat || null; // Backend uses complement for gouv_magasin
    } else if (this.accountType === 'delivery') {
      // livreur table fields - backend expects name or firstName, lastName, city
      signupData.name = `${this.firstName} ${this.lastName}`;
      signupData.firstName = this.firstName;
      signupData.lastName = this.lastName;
      signupData.city = this.ville_livraison || null;
      signupData.availabilityTime = this.disponibilite || null;
    } else if (this.accountType === 'customer') {
      // client table fields - backend expects name or firstName, lastName, ville, complement
      signupData.name = `${this.firstName} ${this.lastName}`;
      signupData.firstName = this.firstName;
      signupData.lastName = this.lastName;
      signupData.ville = this.ville || null;
      signupData.complement = this.gouvernorat || null; // Backend uses complement for gouv_client
    }
    
    console.log('📤 Sending registration data:', signupData);
    console.log('🌐 API URL:', `${window.location.protocol}//${window.location.hostname}:5000/api/auth/register`);
    console.log('⏳ Starting request...');
    
    this.authService.register(signupData).subscribe({
      next: (response) => {
        console.log('✅ Registration response received:', response);
        this.isLoading = false;
        
        if (response.success) {
          // Save user data and token for auto-login
          if (response.token) {
            this.authService.saveToken(response.token);
          }
          if (response.user) {
            this.authService.saveUserData(response.user);
          }
          
          const accountTypeText = this.accountType === 'delivery' ? 'Delivery Partner' : 
                                 this.accountType === 'provider' ? 'Store Provider' : 'Customer';
          
          // Show success message and redirect to home page
          alert(`Welcome ${response.user?.name || ''}! Your ${accountTypeText} account has been created successfully.`);
          this.router.navigate(['/']);
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