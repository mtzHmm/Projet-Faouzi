import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit, OnDestroy {
  cartItemCount = 3;
  totalPrice = 12530;
  isLoggedIn = false;
  userName = '';
  private authSubscription: Subscription = new Subscription();

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.checkAuthStatus();
    
    // Subscribe to authentication status changes
    this.authSubscription = this.authService.authStatus$.subscribe(
      (isAuthenticated: boolean) => {
        this.isLoggedIn = isAuthenticated;
        if (isAuthenticated) {
          this.userName = this.authService.getUserName();
        } else {
          this.userName = '';
        }
      }
    );
  }

  ngOnDestroy() {
    this.authSubscription.unsubscribe();
  }

  checkAuthStatus() {
    this.isLoggedIn = this.authService.isLoggedIn();
    if (this.isLoggedIn) {
      this.userName = this.authService.getUserName();
    }
  }

  logout() {
    this.authService.removeToken();
    this.isLoggedIn = false;
    this.userName = '';
    this.router.navigate(['/']);
  }
}