import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { OrderService, Order as ServiceOrder, OrderItem as ServiceOrderItem } from '../../../services/order.service';

interface Order {
  id: number;
  userId: number;
  userName: string;
  userEmail?: string;
  total: number;
  status: 'en_cours' | 'livrée' | 'annulée';
  createdAt: Date;
  deliveryAddress?: string;
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
  category?: string;
}

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, FormsModule],
  templateUrl: './admin-orders.component.html',
  styleUrl: './admin-orders.component.css'
})
export class AdminOrdersComponent implements OnInit {
  orders: Order[] = [];
  filteredOrders: Order[] = [];
  selectedStatus: string = '';
  searchTerm: string = '';
  selectedOrder: Order | null = null;
  showOrderDetails: boolean = false;
  loading: boolean = false;
  error: string = '';

  constructor(private orderService: OrderService) {}

  statusOptions = [
    { value: '', label: 'Tous les statuts' },
    { value: 'en_cours', label: 'En cours' },
    { value: 'livrée', label: 'Livrée' },
    { value: 'annulée', label: 'Annulée' }
  ];

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    this.loading = true;
    this.error = '';
    
    const filters: any = { limit: 100 };
    
    this.orderService.getOrders(filters).subscribe({
      next: (response) => {
        this.orders = response.orders.map(order => ({
          ...order,
          userEmail: order.userName + '@email.com',  // Temporal fix until backend provides email
          deliveryAddress: 'Adresse non disponible',
          createdAt: new Date(order.createdAt)
        }));
        this.filterOrders();
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des commandes:', error);
        this.error = 'Erreur lors du chargement des commandes. Veuillez réessayer.';
        this.loading = false;
      }
    });
  }

  filterOrders() {
    this.filteredOrders = this.orders.filter(order => {
      const matchesStatus = !this.selectedStatus || order.status === this.selectedStatus;
      const matchesSearch = !this.searchTerm || 
        order.userName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        order.id.toString().includes(this.searchTerm) ||
        (order.userEmail && order.userEmail.toLowerCase().includes(this.searchTerm.toLowerCase()));
      
      return matchesStatus && matchesSearch;
    });
  }

  onStatusChange() {
    if (this.selectedStatus) {
      this.loadOrdersByStatus();
    } else {
      this.loadOrders();
    }
  }

  loadOrdersByStatus() {
    this.loading = true;
    this.error = '';
    
    const filters: any = { 
      status: this.selectedStatus,
      limit: 100 
    };
    
    this.orderService.getOrders(filters).subscribe({
      next: (response) => {
        this.orders = response.orders.map(order => ({
          ...order,
          userEmail: order.userName + '@email.com',
          deliveryAddress: 'Adresse non disponible',
          createdAt: new Date(order.createdAt)
        }));
        this.filterOrders();
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des commandes:', error);
        this.error = 'Erreur lors du chargement des commandes. Veuillez réessayer.';
        this.loading = false;
      }
    });
  }

  onSearchChange() {
    this.filterOrders();
  }

  updateOrderStatus(orderId: number, newStatus: string) {
    this.orderService.updateOrderStatus(orderId, newStatus).subscribe({
      next: (updatedOrder) => {
        const order = this.orders.find(o => o.id === orderId);
        if (order) {
          order.status = newStatus as any;
          this.filterOrders();
        }
        console.log('Statut de la commande mis à jour:', updatedOrder);
      },
      error: (error) => {
        console.error('Erreur lors de la mise à jour du statut:', error);
        alert('Erreur lors de la mise à jour du statut de la commande');
      }
    });
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