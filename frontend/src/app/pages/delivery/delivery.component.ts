import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  total: number;
}

interface Order {
  id: string;
  storeName: string;
  storeAddress: string;
  customer: {
    firstName: string;
    lastName: string;
    fullName: string;
  };
  phone: string;
  address: string;
  items: OrderItem[];
  itemsText: string;
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
      storeName: 'Bella Pizza',
      storeAddress: '45 Avenue Habib Bourguiba, Tunis',
      customer: {
        firstName: 'hamam',
        lastName: 'Mootaz',
        fullName: 'hamam Mootaz'
      },
      phone: '+216 20 123 456',
      address: '123 Rue de la République, Tunis',
      items: [
        { name: 'pizza neptune', quantity: 2, price: 4.00, total: 8.00 },
        { name: 'pizza pepperoni', quantity: 1, price: 10.00, total: 10.00 }
      ],
      itemsText: 'pizza neptune x2, pizza pepperoni x1',
      status: 'en_attente',
      amount: 18.00,
      createdAt: new Date('2024-12-14T10:30:00')
    },
    {
      id: 'ORD002',
      storeName: 'Urban Fashion',
      storeAddress: '78 Rue de la Paix, Sfax',
      customer: {
        firstName: 'jaafeer',
        lastName: 'seif',
        fullName: 'jaafeer seif'
      },
      phone: '+216 25 987 654',
      address: '456 Avenue Habib Bourguiba, Sfax',
      items: [
        { name: 'T-shirt Homme', quantity: 1, price: 25.00, total: 25.00 },
        { name: 'Jean Slim', quantity: 1, price: 65.00, total: 65.00 }
      ],
      itemsText: 'T-shirt Homme x1, Jean Slim x1',
      status: 'en_préparation',
      amount: 90.00,
      createdAt: new Date('2024-12-14T09:15:00')
    },
    {
      id: 'ORD003',
      storeName: 'Pharma Plus',
      storeAddress: '52 Rue du Port, Sousse',
      customer: {
        firstName: 'Test',
        lastName: 'Client',
        fullName: 'Test Client'
      },
      phone: '+216 22 456 789',
      address: '789 Rue Mongi Slim, Sousse',
      items: [
        { name: 'Doliprane', quantity: 2, price: 20.00, total: 40.00 },
        { name: 'Panadole', quantity: 1, price: 30.00, total: 30.00 }
      ],
      itemsText: 'Doliprane x2, Panadole x1',
      status: 'en_livraison',
      amount: 70.00,
      createdAt: new Date('2024-12-13T16:45:00')
    },
    {
      id: 'ORD004',
      storeName: 'Green Market',
      storeAddress: '33 Boulevard du 7 Novembre, Monastir',
      customer: {
        firstName: 'uac',
        lastName: 'hend',
        fullName: 'uac hend'
      },
      phone: '+216 29 654 321',
      address: '321 Boulevard du 7 Novembre, Monastir',
      items: [
        { name: 'Pain complet', quantity: 3, price: 2.50, total: 7.50 },
        { name: 'Œufs bio', quantity: 2, price: 4.80, total: 9.60 },
        { name: 'Eau minérale', quantity: 6, price: 1.20, total: 7.20 }
      ],
      itemsText: 'Pain complet x3, Œufs bio x2, Eau minérale x6',
      status: 'préparée',
      amount: 24.30,
      createdAt: new Date('2024-12-14T14:20:00')
    },
    {
      id: 'ORD005',
      storeName: 'Test Store',
      storeAddress: '19 Rue Ibn Khaldoun, Bizerte',
      customer: {
        firstName: 'fadit',
        lastName: 'ali',
        fullName: 'fadit ali'
      },
      phone: '+216 24 789 123',
      address: '654 Rue Ibn Khaldoun, Bizerte',
      items: [
        { name: 'Baskets', quantity: 1, price: 85.00, total: 85.00 }
      ],
      itemsText: 'Baskets x1',
      status: 'livrée',
      amount: 85.00,
      createdAt: new Date('2024-12-13T11:30:00')
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
