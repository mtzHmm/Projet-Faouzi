import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

interface Order {
  id: string;
  storeName: string;
  storeAddress: string;
  customer: string;
  phone: string;
  address: string;
  items: string[];
  status: 'en_attente' | 'en_préparation' | 'préparée' | 'annulée' | 'en_livraison' | 'livrée';
  amount: number;
  createdAt: Date;
}

@Component({
  selector: 'app-delivery',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './delivery.component.html',
  styleUrls: ['./delivery.component.css']
})
export class DeliveryComponent implements OnInit {
  deliveryName = 'Ahmed Ben Ali';
  totalEarnings = 1250.50;
  completedDeliveries = 24;
  rating = 4.8;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.loadUserData();
  }

  loadUserData() {
    const userData = this.authService.getUserData();
    if (userData) {
      this.deliveryName = this.authService.getFullUserName() || 'Delivery Partner';
    }
  }

  selectedTab: 'pending' | 'accepted' | 'delivered' = 'pending';
  selectedOrder: Order | null = null;
  showModal = false;

  orders: Order[] = [
    {
      id: 'ORD001',
      storeName: 'Burger Palace',
      storeAddress: '45 Avenue Habib Bourguiba, Tunis',
      customer: 'Sara Karim',
      phone: '+216 XX XXX XXX',
      address: '123 Main St, Tunis',
      items: ['Burger x2', 'Pizza x1', 'Drinks x3'],
      status: 'en_attente',
      amount: 45.50,
      createdAt: new Date('2025-11-30T10:00:00')
    },
    {
      id: 'ORD002',
      storeName: 'Sandwich House',
      storeAddress: '78 Rue de la Paix, Sfax',
      customer: 'Mohamed Saiid',
      phone: '+216 XX XXX XXX',
      address: '456 Oak Ave, Sfax',
      items: ['Sandwich x3'],
      status: 'en_attente',
      amount: 32.00,
      createdAt: new Date('2025-11-30T10:15:00')
    },
    {
      id: 'ORD003',
      storeName: 'Kebab Grill',
      storeAddress: '52 Rue du Port, Sousse',
      customer: 'Leila Mansouri',
      phone: '+216 XX XXX XXX',
      address: '789 Pine Rd, Sousse',
      items: ['Kebab x2', 'Salad x1'],
      status: 'en_préparation',
      amount: 28.75,
      createdAt: new Date('2025-11-30T09:30:00')
    },
    {
      id: 'ORD004',
      storeName: 'Tacos Express',
      storeAddress: '33 Boulevard Abou Kacem Chebbi, Kairouan',
      customer: 'Nasser Hamda',
      phone: '+216 XX XXX XXX',
      address: '321 Elm St, Kairouan',
      items: ['Tacos x4'],
      status: 'en_livraison',
      amount: 55.00,
      createdAt: new Date('2025-11-30T08:45:00')
    },
    {
      id: 'ORD005',
      storeName: 'Fast Food Corner',
      storeAddress: '19 Rue de la Mer, Djerba',
      customer: 'Amira Khalil',
      phone: '+216 XX XXX XXX',
      address: '654 Maple Ln, Djerba',
      items: ['Burger x1', 'Fries x2'],
      status: 'livrée',
      amount: 38.50,
      createdAt: new Date('2025-11-30T07:00:00')
    }
  ];

  get pendingOrders(): Order[] {
    return this.orders.filter(o => o.status === 'en_attente');
  }

  get acceptedOrders(): Order[] {
    return this.orders.filter(o => o.status === 'en_préparation' || o.status === 'préparée' || o.status === 'en_livraison');
  }

  get deliveredOrders(): Order[] {
    return this.orders.filter(o => o.status === 'livrée');
  }

  acceptOrder(orderId: string) {
    const order = this.orders.find(o => o.id === orderId);
    if (order) {
      order.status = 'en_préparation';
    }
  }

  pickupOrder(orderId: string) {
    const order = this.orders.find(o => o.id === orderId);
    if (order) {
      order.status = 'en_livraison';
    }
  }

  completeDelivery(orderId: string) {
    const order = this.orders.find(o => o.id === orderId);
    if (order) {
      order.status = 'livrée';
      this.completedDeliveries++;
      this.totalEarnings += order.amount * 0.15; // 15% commission
    }
  }

  rejectOrder(orderId: string) {
    this.orders = this.orders.filter(o => o.id !== orderId);
  }

  getStatusBadgeClass(status: string): string {
    switch(status) {
      case 'en_attente': return 'badge-pending';
      case 'en_préparation': return 'badge-accepted';
      case 'préparée': return 'badge-ready';
      case 'en_livraison': return 'badge-picked';
      case 'livrée': return 'badge-delivered';
      case 'annulée': return 'badge-cancelled';
      default: return '';
    }
  }

  getStatusLabel(status: string): string {
    switch(status) {
      case 'en_attente': return 'En Attente';
      case 'en_préparation': return 'En Préparation';
      case 'préparée': return 'Préparée';
      case 'en_livraison': return 'En Livraison';
      case 'livrée': return 'Livrée';
      case 'annulée': return 'Annulée';
      default: return status;
    }
  }

  selectOrder(order: Order) {
    this.selectedOrder = order;
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.selectedOrder = null;
  }
}
