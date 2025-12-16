import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
  category: string;
  type: string; // boutique, restaurant, pharmacie, courses
  productId: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItems: CartItem[] = [];
  private cartSubject = new BehaviorSubject<CartItem[]>([]);
  public cart$ = this.cartSubject.asObservable();

  constructor(private authService: AuthService) {
    this.loadCartFromStorage();
    
    // Listen to auth changes to clear cart on logout
    this.authService.authStatus$.subscribe(isLoggedIn => {
      if (!isLoggedIn) {
        this.clearCart();
      }
    });
  }

  /**
   * Load cart from localStorage for the current user
   */
  private loadCartFromStorage(): void {
    const user = this.authService.getUserData();
    if (!user) {
      console.log('⚠️ No user logged in - cart is empty');
      this.cartItems = [];
      this.cartSubject.next([]);
      return;
    }

    const cartKey = `cart_${user.id}`;
    console.log('🔑 Loading cart with key:', cartKey);
    const savedCart = localStorage.getItem(cartKey);
    
    if (savedCart) {
      this.cartItems = JSON.parse(savedCart);
      this.cartSubject.next([...this.cartItems]);
      console.log('✅ Cart loaded for user ID:', user.id, '→', this.cartItems.length, 'items');
    } else {
      console.log('📭 No saved cart found for user ID:', user.id);
    }
  }

  /**
   * Save cart to localStorage for the current user
   */
  private saveCartToStorage(): void {
    const user = this.authService.getUserData();
    if (!user) {
      console.log('⚠️ Cannot save cart - no user logged in');
      return;
    }

    const cartKey = `cart_${user.id}`;
    localStorage.setItem(cartKey, JSON.stringify(this.cartItems));
    console.log('💾 Cart saved → localStorage key:', cartKey, '→', this.cartItems.length, 'items');
  }

  /**
   * Add a product to cart
   */
  addToCart(product: any, type: string): void {
    const user = this.authService.getUserData();
    if (!user) {
      alert('Veuillez vous connecter pour ajouter des produits au panier');
      console.log('❌ Cannot add to cart - user not logged in');
      return;
    }

    console.log('➕ Adding product to cart for user ID:', user.id);
    console.log('🔍 Product data received:', {
      name: product.name || product.nom,
      price: product.price || product.prix,
      priceType: typeof(product.price || product.prix),
      fullProduct: product
    });

    // Check if product already exists in cart
    const existingItem = this.cartItems.find(
      item => item.productId === product.id && item.type === type
    );

    if (existingItem) {
      existingItem.quantity += 1;
      console.log('🔄 Product quantity increased:', product.name, '→ qty:', existingItem.quantity);
    } else {
      // Default images by type
      const defaultImages: { [key: string]: string } = {
        'restaurant': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&h=200&fit=crop',
        'boutique': 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=200&h=200&fit=crop',
        'pharmacie': 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=200&h=200&fit=crop',
        'courses': 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&h=200&fit=crop'
      };

      const rawPrice = product.price || product.prix || 0;
      const parsedPrice = parseFloat(rawPrice);
      
      console.log('💰 Price processing:', {
        raw: rawPrice,
        parsed: parsedPrice,
        isNaN: isNaN(parsedPrice)
      });

      const cartItem: CartItem = {
        id: Date.now(), // Unique cart item ID
        productId: product.id,
        name: product.name || product.nom,
        price: isNaN(parsedPrice) ? 0 : parsedPrice,
        quantity: 1,
        image: product.image || product.imageUrl || defaultImages[type] || defaultImages['restaurant'],
        category: product.category || product.categorie || type,
        type: type
      };

      console.log('📦 Created cart item:', cartItem);
      this.cartItems.push(cartItem);
      console.log('✅ Product added to cart:', product.name, '→ Type:', type, '→ Price:', cartItem.price);
    }

    this.saveCartToStorage();
    this.cartSubject.next([...this.cartItems]);
  }

  /**
   * Remove item from cart
   */
  removeFromCart(cartItemId: number): void {
    this.cartItems = this.cartItems.filter(item => item.id !== cartItemId);
    this.saveCartToStorage();
    this.cartSubject.next([...this.cartItems]);
    console.log('🗑️ Item removed from cart');
  }

  /**
   * Update item quantity
   */
  updateQuantity(cartItemId: number, quantity: number): void {
    if (quantity < 1) {
      this.removeFromCart(cartItemId);
      return;
    }

    const item = this.cartItems.find(i => i.id === cartItemId);
    if (item) {
      item.quantity = quantity;
      this.saveCartToStorage();
      this.cartSubject.next([...this.cartItems]);
      console.log('🔄 Quantity updated:', item.name, 'qty:', quantity);
    }
  }

  /**
   * Clear all items from cart
   */
  clearCart(): void {
    this.cartItems = [];
    this.cartSubject.next([]);
    
    const user = this.authService.getUserData();
    if (user) {
      const cartKey = `cart_${user.id}`;
      localStorage.removeItem(cartKey);
    }
    console.log('🗑️ Cart cleared');
  }

  /**
   * Get all cart items
   */
  getCartItems(): CartItem[] {
    return [...this.cartItems];
  }

  /**
   * Get cart items count
   */
  getCartCount(): number {
    return this.cartItems.reduce((count, item) => count + item.quantity, 0);
  }

  /**
   * Get cart subtotal
   */
  getSubtotal(): number {
    return this.cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  /**
   * Get cart tax (10%)
   */
  getTax(): number {
    return this.getSubtotal() * 0.1;
  }

  /**
   * Get cart total
   */
  getTotal(): number {
    return this.getSubtotal() + this.getTax();
  }

  /**
   * Check if user is logged in
   */
  isUserLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }
}
