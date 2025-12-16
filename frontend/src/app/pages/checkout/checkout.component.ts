import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CartService, CartItem } from '../../services/cart.service';
import { OrderService, CreateOrderRequest } from '../../services/order.service';
import { AuthService } from '../../services/auth.service';

interface DeliveryInfo {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  governorate: string;
  postalCode: string;
  additionalNotes: string;
}

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {
  cartItems: CartItem[] = [];
  deliveryInfo: DeliveryInfo = {
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    governorate: '',
    postalCode: '',
    additionalNotes: ''
  };

  isProcessing = false;
  isLoggedIn = false;
  userId: number = 0;

  constructor(
    private router: Router,
    private cartService: CartService,
    private orderService: OrderService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Vérifier si l'utilisateur est connecté
    this.isLoggedIn = this.authService.isLoggedIn();
    
    if (!this.isLoggedIn) {
      alert('Veuillez vous connecter pour passer une commande');
      this.router.navigate(['/signin']);
      return;
    }

    // Charger les informations utilisateur
    const userData = this.authService.getUserData();
    if (userData) {
      this.userId = userData.id || userData.user_id;
      this.deliveryInfo.fullName = userData.name || '';
      this.deliveryInfo.email = userData.email || '';
      this.deliveryInfo.phone = userData.phone || '';
      this.deliveryInfo.address = userData.address || '';
    }

    // Charger les articles du panier
    this.cartItems = this.cartService.getCartItems();

    // Si le panier est vide, rediriger vers le panier
    if (this.cartItems.length === 0) {
      alert('Votre panier est vide');
      this.router.navigate(['/cart']);
      return;
    }
  }

  get subtotal(): number {
    return this.cartService.getSubtotal();
  }

  get tax(): number {
    return this.cartService.getTax();
  }

  get deliveryFee(): number {
    return this.subtotal > 50 ? 0 : 7; // Livraison gratuite au-dessus de 50 DT
  }

  get total(): number {
    return this.subtotal + this.tax + this.deliveryFee;
  }

  isFormValid(): boolean {
    return !!(
      this.deliveryInfo.fullName &&
      this.deliveryInfo.email &&
      this.deliveryInfo.phone &&
      this.deliveryInfo.address &&
      this.deliveryInfo.city &&
      this.deliveryInfo.governorate
    );
  }

  confirmOrder() {
    if (!this.isFormValid()) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (this.isProcessing) {
      return;
    }

    this.isProcessing = true;

    // Préparer les données de la commande
    const orderData: CreateOrderRequest = {
      userId: this.userId,
      userName: this.deliveryInfo.fullName,
      userEmail: this.deliveryInfo.email,
      userPhone: this.deliveryInfo.phone,
      deliveryAddress: this.deliveryInfo.address,
      city: this.deliveryInfo.city,
      governorate: this.deliveryInfo.governorate,
      postalCode: this.deliveryInfo.postalCode,
      additionalNotes: this.deliveryInfo.additionalNotes,
      items: this.cartItems.map(item => ({
        id: item.productId,
        name: item.name,
        quantity: item.quantity,
        price: item.price
      })),
      subtotal: this.subtotal,
      tax: this.tax,
      deliveryFee: this.deliveryFee,
      total: this.total,
      dateCommande: new Date().toISOString().split('T')[0],
      status: 'en cours'  // Use French status that matches DB constraint
    };

    console.log('📦 Creating order:', orderData);
    console.log('🌐 API URL:', `${this.orderService['apiUrl']}`);

    // Créer la commande
    this.orderService.createOrder(orderData).subscribe({
      next: (order) => {
        console.log('✅ Order created successfully:', order);
        console.log('🔍 Order details:', JSON.stringify(order, null, 2));
        
        // Vider le panier
        this.cartService.clearCart();
        
        // Afficher un message de succès
        alert(`Commande confirmée avec succès!\nNuméro de commande: #${order.id}\nTotal: ${this.total.toFixed(2)} DT`);
        
        // Rediriger vers la page d'accueil ou page de confirmation
        this.router.navigate(['/']);
      },
      error: (error) => {
        console.error('❌ Error creating order:', error);
        console.error('🔍 Error details:', JSON.stringify(error, null, 2));
        alert('Erreur lors de la création de la commande. Veuillez réessayer.');
        this.isProcessing = false;
      }
    });
  }

  goBack() {
    this.router.navigate(['/cart']);
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
