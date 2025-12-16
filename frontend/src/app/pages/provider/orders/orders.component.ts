import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  total: number;
}

interface Order {
  id: string;
  customer: {
    firstName: string;
    lastName: string;
    fullName: string;
  };
  store: string;
  items: OrderItem[];
  itemsText: string;
  total: number;
  status: string;
  date: Date;
  address: string;
  phone: string;
  paymentMethod: string;
}

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule, FormsModule],
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css']
})
export class OrdersComponent {
  // Mock data based on provided information
  private users = [
    { firstName: 'TestNom', lastName: 'TestPrenom' },
    { firstName: 'DirectTest', lastName: 'User' },
    { firstName: 'hamam', lastName: 'Mootaz' },
    { firstName: 'jaafeer', lastName: 'seif' },
    { firstName: 'test', lastName: 'test' },
    { firstName: 'Test', lastName: 'Client' },
    { firstName: 'uac', lastName: 'hend' },
    { firstName: 'ee', lastName: 'hend' },
    { firstName: 'yacc', lastName: 'hend' },
    { firstName: 'dwx', lastName: 'xcv' },
    { firstName: 'fadit', lastName: 'ali' },
    { firstName: 'hamma', lastName: 'hamma' }
  ];

  private stores = [
    'Bella Pizza', 'Urban Fashion', 'Pharma Plus', 'Green Market', 
    'Test Store', 'Pizza Palace', 'Test Provider Store', 'Store of Stores', 'DrugStore'
  ];

  private products = [
    'T-shirt Homme', 'Jean Slim', 'Baskets', 'Doliprane', 'Pain complet',
    'Œufs bio', 'Eau minérale', 'Jus', 'soura', 'pizza neptune',
    'pizza pepperoni', 'doliprane', 'Panadole', 'pizza'
  ];

  orders: Order[] = [
    {
      id: '#ORD001',
      customer: {
        firstName: 'hamam',
        lastName: 'Mootaz',
        fullName: 'hamam Mootaz'
      },
      store: 'Bella Pizza',
      items: [
        { name: 'pizza neptune', quantity: 2, price: 4.00, total: 8.00 },
        { name: 'pizza pepperoni', quantity: 1, price: 10.00, total: 10.00 }
      ],
      itemsText: 'pizza neptune x2, pizza pepperoni x1',
      total: 18.00,
      status: 'en_attente',
      date: new Date('2024-12-14T10:30:00'),
      address: '123 Rue de la République, Tunis',
      phone: '+216 20 123 456',
      paymentMethod: 'card'
    },
    {
      id: '#ORD002',
      customer: {
        firstName: 'jaafeer',
        lastName: 'seif',
        fullName: 'jaafeer seif'
      },
      store: 'Urban Fashion',
      items: [
        { name: 'T-shirt Homme', quantity: 1, price: 25.00, total: 25.00 },
        { name: 'Jean Slim', quantity: 1, price: 65.00, total: 65.00 }
      ],
      itemsText: 'T-shirt Homme x1, Jean Slim x1',
      total: 90.00,
      status: 'en_attente',
      date: new Date('2024-12-14T09:15:00'),
      address: '456 Avenue Habib Bourguiba, Sfax',
      phone: '+216 25 987 654',
      paymentMethod: 'cash'
    },
    {
      id: '#ORD003',
      customer: {
        firstName: 'Test',
        lastName: 'Client',
        fullName: 'Test Client'
      },
      store: 'Pharma Plus',
      items: [
        { name: 'Doliprane', quantity: 2, price: 20.00, total: 40.00 },
        { name: 'Panadole', quantity: 1, price: 30.00, total: 30.00 }
      ],
      itemsText: 'Doliprane x2, Panadole x1',
      total: 70.00,
      status: 'acceptée',
      date: new Date('2024-12-13T16:45:00'),
      address: '789 Rue Mongi Slim, Sousse',
      phone: '+216 22 456 789',
      paymentMethod: 'card'
    },
    {
      id: '#ORD004',
      customer: {
        firstName: 'uac',
        lastName: 'hend',
        fullName: 'uac hend'
      },
      store: 'Green Market',
      items: [
        { name: 'Pain complet', quantity: 3, price: 2.50, total: 7.50 },
        { name: 'Œufs bio', quantity: 2, price: 4.80, total: 9.60 },
        { name: 'Eau minérale', quantity: 6, price: 1.20, total: 7.20 }
      ],
      itemsText: 'Pain complet x3, Œufs bio x2, Eau minérale x6',
      total: 24.30,
      status: 'en_cours',
      date: new Date('2024-12-14T14:20:00'),
      address: '321 Boulevard du 7 Novembre, Monastir',
      phone: '+216 29 654 321',
      paymentMethod: 'cash'
    },
    {
      id: '#ORD005',
      customer: {
        firstName: 'fadit',
        lastName: 'ali',
        fullName: 'fadit ali'
      },
      store: 'Test Store',
      items: [
        { name: 'Baskets', quantity: 1, price: 85.00, total: 85.00 }
      ],
      itemsText: 'Baskets x1',
      total: 85.00,
      status: 'refusée',
      date: new Date('2024-12-13T11:30:00'),
      address: '654 Rue Ibn Khaldoun, Bizerte',
      phone: '+216 24 789 123',
      paymentMethod: 'card'
    }
  ];

  filteredOrders = [...this.orders];
  searchTerm = '';
  selectedStatus = '';
  selectedPayment = '';
  
  // Modal state
  showOrderDetails = false;
  selectedOrder: Order | null = null;

  statuses = ['en_attente', 'acceptée', 'refusée', 'en_cours', 'livrée'];
  paymentMethods = ['card', 'cash'];

  filterOrders() {
    this.filteredOrders = this.orders.filter(order => {
      const matchesSearch = order.customer.fullName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                           order.id.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                           order.itemsText.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                           order.store.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesStatus = !this.selectedStatus || order.status === this.selectedStatus;
      const matchesPayment = !this.selectedPayment || order.paymentMethod === this.selectedPayment;
      
      return matchesSearch && matchesStatus && matchesPayment;
    });
  }

  updateStatus(orderId: string, newStatus: string) {
    const order = this.orders.find(o => o.id === orderId);
    if (order) {
      order.status = newStatus;
      this.filterOrders();
      console.log(`Order ${orderId} status updated to: ${newStatus}`);
    }
  }

  acceptOrder(orderId: string) {
    this.updateStatus(orderId, 'acceptée');
  }

  denyOrder(orderId: string) {
    this.updateStatus(orderId, 'refusée');
  }

  viewOrder(orderId: string) {
    const order = this.orders.find(o => o.id === orderId);
    if (order) {
      this.selectedOrder = order;
      this.showOrderDetails = true;
    }
  }

  closeOrderDetails() {
    this.showOrderDetails = false;
    this.selectedOrder = null;
  }

  printOrder(orderId: string) {
    const order = this.orders.find(o => o.id === orderId);
    if (order) {
      console.log('Printing order:', order);
      // In a real application, this would trigger a print dialog or generate a PDF
      alert(`Printing order ${orderId} for ${order.customer.fullName}`);
    }
  }

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'en_attente': '#f59e0b',
      'acceptée': '#10b981',
      'refusée': '#e74c3c',
      'en_cours': '#3b82f6',
      'livrée': '#059669'
    };
    return colors[status] || '#6b7280';
  }

  getStatusClass(status: string): string {
    const classes: { [key: string]: string } = {
      'en_attente': 'en-attente',
      'acceptée': 'acceptee',
      'refusée': 'refusee',
      'en_cours': 'en-cours',
      'livrée': 'livree'
    };
    return classes[status] || '';
  }

  getStatusText(status: string): string {
    const texts: { [key: string]: string } = {
      'en_attente': 'En Attente',
      'acceptée': 'Acceptée',
      'refusée': 'Refusée',
      'en_cours': 'En Cours',
      'livrée': 'Livrée'
    };
    return texts[status] || status;
  }

  canAcceptOrDeny(status: string): boolean {
    return status === 'en_attente';
  }

  get totalOrderValue(): number {
    return this.filteredOrders.reduce((sum, order) => sum + order.total, 0);
  }
}