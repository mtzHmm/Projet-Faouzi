import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { OrderService, Order } from '../../services/order.service';

@Component({
  selector: 'app-myorders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './myorders.component.html',
  styleUrls: ['./myorders.component.css']
})
export class MyordersComponent implements OnInit {
  orders: Order[] = [];
  filteredOrders: Order[] = [];
  selectedStatus: string = 'all';
  selectedOrder: Order | null = null;
  showOrderDetails: boolean = false;
  loading: boolean = true;
  error: string = '';
  clientName: string = '';
  clientId: number | null = null;

  // Stats
  totalOrders: number = 0;
  completedOrders: number = 0;
  pendingOrders: number = 0;
  totalSpent: number = 0;

  constructor(
    private authService: AuthService,
    private orderService: OrderService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadUserData();
    // Wait a tick to ensure clientId is set before loading orders
    setTimeout(() => {
      this.loadOrders();
    }, 0);
  }

  loadUserData() {
    const userData = this.authService.getUserData();
    if (userData) {
      this.clientName = this.authService.getFullUserName() || 'Client';
      this.clientId = userData.id_client || userData.id;
      console.log('👤 Client ID:', this.clientId, 'Name:', this.clientName);
    }
  }

  loadOrders() {
    if (!this.clientId) {
      this.error = 'Unable to load orders. Please log in again.';
      this.loading = false;
      return;
    }

    this.loading = true;
    this.error = '';

    console.log('📦 Loading orders for client:', this.clientId);

    this.orderService.getOrders({ userId: this.clientId, limit: 100 }).subscribe({
      next: (response) => {
        console.log('✅ Orders loaded:', response);
        this.orders = response.orders || [];
        this.filteredOrders = [...this.orders];
        this.calculateStats();
        this.loading = false;
        this.cdr.detectChanges();
        console.log('🔄 Change detection triggered. Orders count:', this.filteredOrders.length);
      },
      error: (error) => {
        console.error('❌ Error loading orders:', error);
        this.error = 'Failed to load your orders. Please try again later.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  calculateStats() {
    this.totalOrders = this.orders.length;
    this.completedOrders = this.orders.filter(o => o.status === 'livrée').length;
    this.pendingOrders = this.orders.filter(o => 
      o.status === 'en attente' || o.status === 'en cours' || o.status === 'préparée'
    ).length;
    this.totalSpent = this.orders
      .filter(o => o.status === 'livrée')
      .reduce((sum, order) => sum + (order.total || 0), 0);
  }

  filterOrders() {
    if (this.selectedStatus === 'all') {
      this.filteredOrders = [...this.orders];
    } else {
      this.filteredOrders = this.orders.filter(order => 
        order.status === this.selectedStatus
      );
    }
    this.cdr.detectChanges();
    console.log('🔍 Filter applied. Showing', this.filteredOrders.length, 'orders');
  }

  viewOrderDetails(order: Order) {
    this.selectedOrder = order;
    this.showOrderDetails = true;
  }

  closeOrderDetails() {
    this.showOrderDetails = false;
    this.selectedOrder = null;
  }

  getStatusClass(status: string): string {
    const statusMap: { [key: string]: string } = {
      'en attente': 'status-pending',
      'en cours': 'status-processing',
      'préparée': 'status-prepared',
      'en livraison': 'status-delivery',
      'livrée': 'status-delivered',
      'annulée': 'status-cancelled'
    };
    return statusMap[status] || 'status-default';
  }

  getStatusLabel(status: string): string {
    const statusLabels: { [key: string]: string } = {
      'en attente': 'En attente',
      'en cours': 'En préparation',
      'préparée': 'Prête',
      'en livraison': 'En livraison',
      'livrée': 'Livrée',
      'annulée': 'Annulée'
    };
    return statusLabels[status] || status;
  }

  formatDate(date: string | Date): string {
    const d = new Date(date);
    return d.toLocaleDateString('fr-FR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatPrice(price: number): string {
    return `${price.toFixed(2)} DT`;
  }

  canCancelOrder(order: Order): boolean {
    return order.status === 'en attente' || order.status === 'en cours';
  }

  cancelOrder(orderId: number) {
    if (!confirm('Êtes-vous sûr de vouloir annuler cette commande ?')) {
      return;
    }

    this.orderService.updateOrderStatus(orderId, 'annulée').subscribe({
      next: () => {
        alert('Commande annulée avec succès');
        this.loadOrders();
        this.closeOrderDetails();
      },
      error: (error) => {
        console.error('❌ Error cancelling order:', error);
        alert('Erreur lors de l\'annulation de la commande');
      }
    });
  }

  trackOrder(order: Order) {
    alert(`Suivi de la commande #${order.id} - Statut: ${this.getStatusLabel(order.status)}`);
  }

  reorder(order: Order) {
    alert('Fonctionnalité de re-commande à venir');
  }
}
