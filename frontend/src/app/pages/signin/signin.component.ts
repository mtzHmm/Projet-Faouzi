import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-signin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './signin.component.html',
  styleUrl: './signin.component.css'
})
export class SigninComponent {
  email: string = '';
  password: string = '';
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(
    private router: Router,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  onSubmit() {
    this.errorMessage = '';
    
    if (!this.email || !this.password) {
      setTimeout(() => {
        this.errorMessage = 'Please fill in all fields';
        this.cdr.detectChanges();
      });
      return;
    }

    this.isLoading = true;
    
    console.log('🔐 Attempting login for:', this.email);
    
    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: (response) => {
        this.isLoading = false;
        console.log('✅ Login response:', response);
        
        if (response.success && response.token) {
          this.authService.saveToken(response.token);
          
          // Save user data if provided
          if (response.user) {
            this.authService.saveUserData(response.user);
          }
          
          console.log('🎉 Login successful, navigating to home...');
          
          // Navigate based on user role
          const userRole = response.user?.role?.toLowerCase();
          if (userRole === 'admin') {
            this.router.navigate(['/admin']);
          } else if (userRole === 'provider') {
            this.router.navigate(['/provider']);
          } else if (userRole === 'livreur') {
            this.router.navigate(['/delivery']);
          } else {
            this.router.navigate(['/']);
          }
        } else {
          setTimeout(() => {
            this.errorMessage = response.message || 'Login failed. Please try again.';
            this.cdr.detectChanges();
          });
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('❌ Login error:', error);
        
        // Use setTimeout to defer the error message update to avoid ExpressionChangedAfterItHasBeenCheckedError
        setTimeout(() => {
          if (error.status === 0) {
            this.errorMessage = 'Cannot connect to server. Please make sure the backend server is running.';
          } else if (error.status === 401) {
            this.errorMessage = 'Invalid email or password. Please check your credentials and try again.';
          } else if (error.error?.error) {
            this.errorMessage = error.error.error;
          } else if (error.error?.message) {
            this.errorMessage = error.error.message;
          } else {
            this.errorMessage = 'Login failed. Please try again later.';
          }
          this.cdr.detectChanges();
        });
      }
    });
  }
}