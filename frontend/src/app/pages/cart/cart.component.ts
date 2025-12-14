import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { CartService, CartItem } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {
  cartItems: CartItem[] = [];
  isLoggedIn = false;
  userName = '';

  constructor(
    private router: Router,
    private cartService: CartService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Check if user is logged in
    this.isLoggedIn = this.authService.isLoggedIn();
    this.userName = this.authService.getFullUserName();

    // Subscribe to cart changes
    this.cartService.cart$.subscribe(items => {
      this.cartItems = items;
      console.log('🛒 Cart updated:', this.cartItems.length, 'items');
    });

    // Load initial cart items
    this.cartItems = this.cartService.getCartItems();
  }

  updateQuantity(itemId: number, newQuantity: number) {
    this.cartService.updateQuantity(itemId, newQuantity);
  }

  removeItem(itemId: number) {
    this.cartService.removeFromCart(itemId);
  }

  get subtotal(): number {
    return this.cartService.getSubtotal();
  }

  get tax(): number {
    return this.cartService.getTax();
  }

  get total(): number {
    return this.cartService.getTotal();
  }

  clearCart() {
    if (confirm('Êtes-vous sûr de vouloir vider le panier ?')) {
      this.cartService.clearCart();
    }
  }

  checkout() {
    if (!this.isLoggedIn) {
      alert('Veuillez vous connecter pour passer commande');
      this.router.navigate(['/signin']);
      return;
    }

    if (this.cartItems.length === 0) {
      alert('Votre panier est vide');
      return;
    }

    // Rediriger vers la page de checkout
    this.router.navigate(['/checkout']);
  }

  continueShopping() {
    // Navigate back to home
    this.router.navigate(['/']);
  }

  getCategoryEmoji(type: string): string {
    const emojiMap: { [key: string]: string } = {
      'boutique': '👕',
      'restaurant': '🍔',
      'pharmacie': '💊',
      'courses': '🛒'
    };
    return emojiMap[type?.toLowerCase()] || '🛍️';
  }
}
