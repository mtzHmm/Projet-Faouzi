import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit, OnDestroy {
  cartItemCount = 0;
  totalPrice = 0;
  isLoggedIn = false;
  userName = '';
  userId = '';
  isAdmin = false;
  isProvider = false;
  isDelivery = false;
  private authSubscription: Subscription = new Subscription();
  private cartSubscription: Subscription = new Subscription();

  constructor(
    private authService: AuthService,
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit() {
    this.checkAuthStatus();
    
    // Subscribe to authentication status changes
    this.authSubscription = this.authService.authStatus$.subscribe(
      (isAuthenticated: boolean) => {
        console.log('🔐 Auth status changed:', isAuthenticated);
        this.isLoggedIn = isAuthenticated;
        if (isAuthenticated) {
          const userData = this.authService.getUserData();
          console.log('👤 User data:', userData);
          this.userName = this.authService.getFullUserName();
          this.userId = userData?.id || userData?.user_id || '';
          this.isAdmin = this.authService.isAdmin();
          this.isProvider = this.authService.isProvider();
          this.isDelivery = this.authService.isDelivery();
          console.log('✅ Header - User:', this.userName, 'ID:', this.userId, 'Admin:', this.isAdmin, 'Provider:', this.isProvider, 'Delivery:', this.isDelivery);
        } else {
          this.userName = '';
          this.userId = '';
          this.isAdmin = false;
          this.isProvider = false;
          this.isDelivery = false;
        }
      }
    );

    // Subscribe to cart changes
    this.cartSubscription = this.cartService.cart$.subscribe(() => {
      this.updateCartInfo();
    });

    // Initialize cart info
    this.updateCartInfo();
  }

  ngOnDestroy() {
    this.authSubscription.unsubscribe();
    this.cartSubscription.unsubscribe();
  }

  updateCartInfo() {
    this.cartItemCount = this.cartService.getCartCount();
    const userData = this.authService.getUserData();
    console.log('🔍 Checking auth - User data:', userData);
    this.userName = this.authService.getFullUserName();
    this.userId = userData?.id || userData?.user_id || '';
    console.log('✅ Auth check - User:', this.userName, 'ID:', this.userId);
  }

  checkAuthStatus() {
    this.isLoggedIn = this.authService.isLoggedIn();
    if (this.isLoggedIn) {
      this.userName = this.authService.getFullUserName();
      const userData = this.authService.getUserData();
      this.userId = userData?.id || userData?.user_id || '';
      this.isAdmin = this.authService.isAdmin();
      this.isProvider = this.authService.isProvider();
      this.isDelivery = this.authService.isDelivery();
    } else {
      this.userName = '';
      this.userId = '';
      this.isAdmin = false;
      this.isProvider = false;
      this.isDelivery = false;
    }
  }

  logout() {
    this.authService.removeToken();
    this.isLoggedIn = false;
    this.userName = '';
    this.userId = '';
    this.isAdmin = false;
    this.isProvider = false;
    this.isDelivery = false;
    this.router.navigate(['/']);
  }
}