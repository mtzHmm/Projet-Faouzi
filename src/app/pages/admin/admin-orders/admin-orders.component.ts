import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface Order {
  id: number;
  userId: number;
  userName: string;
  userEmail: string;
  total: number;
  status: 'en_attente' | 'prepare' | 'en_livraison' | 'livre' | 'annule';
  createdAt: Date;
  deliveryAddress: string;
  items: OrderItem[];
  deliveryTime?: Date;
  livreurId?: number;
  livreurName?: string;
}

interface OrderItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  category: string;
}

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, FormsModule],
  templateUrl: './admin-orders.component.html',
  styleUrl: './admin-orders.component.css'
})
export class AdminOrdersComponent {
  orders: Order[] = [
    {
      id: 1001,
      userId: 123,
      userName: 'Sophie Martin',
      userEmail: 'sophie.martin@email.com',
      total: 45.80,
      status: 'en_livraison',
      createdAt: new Date('2025-11-28T14:30:00'),
      deliveryAddress: '123 Rue de la Paix, 75001 Paris',
      deliveryTime: new Date('2025-11-28T15:30:00'),
      livreurId: 456,
      livreurName: 'Marc Dubois',
      items: [
        { id: 1, name: 'Pizza Margherita', price: 12.50, quantity: 2, category: 'Restaurant' },
        { id: 2, name: 'Coca Cola', price: 2.50, quantity: 2, category: 'Boissons' },
        { id: 3, name: 'Tiramisu', price: 6.80, quantity: 1, category: 'Desserts' }
      ]
    },
    {
      id: 1002,
      userId: 789,
      userName: 'Laura Petit',
      userEmail: 'laura.petit@email.com',
      total: 67.30,
      status: 'prepare',
      createdAt: new Date('2025-11-28T14:20:00'),
      deliveryAddress: '456 Avenue des Champs, 75008 Paris',
      items: [
        { id: 4, name: 'Salade César', price: 8.90, quantity: 1, category: 'Restaurant' },
        { id: 5, name: 'Saumon grillé', price: 18.50, quantity: 2, category: 'Restaurant' },
        { id: 6, name: 'Vin blanc', price: 15.40, quantity: 1, category: 'Boissons' }
      ]
    },
    {
      id: 1003,
      userId: 321,
      userName: 'Thomas Bernard',
      userEmail: 'thomas.bernard@email.com',
      total: 28.90,
      status: 'en_attente',
      createdAt: new Date('2025-11-28T13:45:00'),
      deliveryAddress: '789 Boulevard Saint-Germain, 75006 Paris',
      items: [
        { id: 7, name: 'Burger Bacon', price: 14.90, quantity: 1, category: 'Restaurant' },
        { id: 8, name: 'Frites', price: 4.50, quantity: 2, category: 'Restaurant' },
        { id: 9, name: 'Milkshake', price: 5.50, quantity: 1, category: 'Boissons' }
      ]
    },
    {
      id: 1004,
      userId: 654,
      userName: 'Emma Rousseau',
      userEmail: 'emma.rousseau@email.com',
      total: 92.10,
      status: 'livre',
      createdAt: new Date('2025-11-28T12:30:00'),
      deliveryAddress: '321 Rue de Rivoli, 75004 Paris',
      deliveryTime: new Date('2025-11-28T13:45:00'),
      livreurId: 789,
      livreurName: 'Pierre Martin',
      items: [
        { id: 10, name: 'Sushi Mix', price: 25.90, quantity: 2, category: 'Restaurant' },
        { id: 11, name: 'Miso Soup', price: 4.50, quantity: 2, category: 'Restaurant' },
        { id: 12, name: 'Saké', price: 12.80, quantity: 1, category: 'Boissons' }
      ]
    }
  ];

  filteredOrders: Order[] = [...this.orders];
  selectedStatus: string = '';
  searchTerm: string = '';
  selectedOrder: Order | null = null;
  showOrderDetails: boolean = false;

  statusOptions = [
    { value: '', label: 'Tous les statuts' },
    { value: 'en_attente', label: 'En attente' },
    { value: 'prepare', label: 'En préparation' },
    { value: 'en_livraison', label: 'En livraison' },
    { value: 'livre', label: 'Livré' },
    { value: 'annule', label: 'Annulé' }
  ];

  ngOnInit() {
    this.filterOrders();
  }

  filterOrders() {
    this.filteredOrders = this.orders.filter(order => {
      const matchesStatus = !this.selectedStatus || order.status === this.selectedStatus;
      const matchesSearch = !this.searchTerm || 
        order.userName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        order.id.toString().includes(this.searchTerm) ||
        order.userEmail.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      return matchesStatus && matchesSearch;
    });
  }

  onStatusChange() {
    this.filterOrders();
  }

  onSearchChange() {
    this.filterOrders();
  }

  updateOrderStatus(orderId: number, newStatus: string) {
    const order = this.orders.find(o => o.id === orderId);
    if (order) {
      order.status = newStatus as any;
      this.filterOrders();
    }
  }

  updateOrderStatusFromEvent(orderId: number, event: Event) {
  const select = event.target as HTMLSelectElement | null;
  if (select) {
    this.updateOrderStatus(orderId, select.value);
  }
}


  viewOrderDetails(order: Order) {
    this.selectedOrder = order;
    this.showOrderDetails = true;
  }

  closeOrderDetails() {
    this.showOrderDetails = false;
    this.selectedOrder = null;
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'en_attente': return '#f59e0b';
      case 'prepare': return '#3b82f6';
      case 'en_livraison': return '#f97316';
      case 'livre': return '#10b981';
      case 'annule': return '#e74c3c';
      default: return '#95a5a6';
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'en_attente': return 'en-attente';
      case 'prepare': return 'en-preparation';
      case 'en_livraison': return 'en-livraison';
      case 'livre': return 'livre';
      case 'annule': return 'annule';
      default: return '';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'en_attente': return 'En Attente';
      case 'prepare': return 'En Préparation';
      case 'en_livraison': return 'En Livraison';
      case 'livre': return 'Livré';
      case 'annule': return 'Annulé';
      default: return status;
    }
  }

  getTotalItems(order: Order): number {
    return order.items.reduce((sum, item) => sum + item.quantity, 0);
  }
}