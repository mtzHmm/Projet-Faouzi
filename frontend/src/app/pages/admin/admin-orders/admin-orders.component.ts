import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { OrderService, Order, OrderItem } from '../../../services/order.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, FormsModule],
  templateUrl: './admin-orders.component.html',
  styleUrl: './admin-orders.component.css'
})
export class AdminOrdersComponent implements OnInit {
  // Component properties
  orders: Order[] = [];
  filteredOrders: Order[] = [];
  selectedOrder: Order | null = null;
  showOrderDetails = false;
  loading = false;
  error: string | null = null;

  // Filter properties
  searchTerm = '';
  selectedStatus = 'all';

  statuses = ['en attente', 'en cours', 'préparée', 'livraison', 'livrée', 'annulée'];

  constructor(
    private orderService: OrderService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    console.log('🔄 Starting loadOrders (Admin), setting loading = true');
    this.loading = true;
    this.error = null;
    
    console.log('🔄 Loading orders from database...');
    
    this.orderService.getOrders({}).subscribe({
      next: (response) => {
        console.log('📦 Admin orders response received:', response);
        
        if (response) {
          this.orders = response.orders;
          console.log('📊 Admin orders assigned, calling filterOrders...');
          this.filterOrders();
          console.log(`✅ Admin loaded ${this.orders.length} orders from database`);
        } else {
          console.log('⚠️ Admin response was empty or null');
          this.orders = [];
          this.filteredOrders = [];
        }
        
        console.log('🏁 Admin setting loading = false (success)');
        this.loading = false;
        this.cdr.detectChanges();
        console.log('🔍 Admin final state: loading =', this.loading, 'orders =', this.orders.length, 'filtered =', this.filteredOrders.length);
      },
      error: (error) => {
        console.error('❌ Admin error loading orders:', error);
        this.error = 'Failed to load orders. Please try again.';
        this.orders = [];
        this.filteredOrders = [];
        
        console.log('🏁 Admin setting loading = false (error)');
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  filterOrders() {
    let filtered = [...this.orders];

    // Search filter
    if (this.searchTerm.trim()) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(order => 
        order.userName?.toLowerCase().includes(searchLower) ||
        order.userEmail?.toLowerCase().includes(searchLower) ||
        order.id.toString().includes(searchLower) ||
        order.city?.toLowerCase().includes(searchLower) ||
        order.items.some(item => item.name.toLowerCase().includes(searchLower))
      );
    }

    // Status filter
    if (this.selectedStatus && this.selectedStatus !== 'all') {
      filtered = filtered.filter(order => order.status === this.selectedStatus);
    }

    // Sort orders by date (most recent first)
    filtered.sort((a, b) => {
      const aDate = new Date(a.createdAt).getTime();
      const bDate = new Date(b.createdAt).getTime();
      return bDate - aDate;
    });

    this.filteredOrders = filtered;
    console.log('📋 Admin FilterOrders completed: filtered =', this.filteredOrders.length);
    this.cdr.detectChanges();
  }

  async updateStatus(orderId: string | number, newStatus: string) {
    try {
      console.log(`🔄 Admin updating order ${orderId} status to: ${newStatus}`);
      console.log('🔍 OrderId type:', typeof orderId, 'Value:', orderId);
      
      if (!orderId || isNaN(Number(orderId))) {
        console.error('❌ Invalid orderId in updateStatus:', orderId);
        alert('Erreur: ID de commande invalide');
        return;
      }
      
      const numericId = Number(orderId);
      await this.orderService.updateOrderStatus(numericId, newStatus).toPromise();
      
      // Update local order
      const order = this.orders.find(o => o.id == orderId);
      if (order) {
        order.status = newStatus as any;
        this.filterOrders();
      }
      
      console.log(`✅ Admin order ${orderId} status updated to: ${newStatus}`);
    } catch (error) {
      console.error('❌ Admin error updating order status:', error);
      alert('Failed to update order status. Please try again.');
    }
  }



  rejectOrder(orderId: string | number) {
    console.log('🔍 Debug orderId:', orderId, typeof orderId);
    
    if (!orderId || isNaN(Number(orderId))) {
      console.error('❌ Invalid orderId:', orderId);
      alert('Erreur: ID de commande invalide');
      return;
    }
    
    const confirmReject = confirm('Voulez-vous vraiment rejeter cette commande ? Cette action est irréversible.');
    if (confirmReject) {
      this.updateStatus(orderId, 'annulée');
    }
  }

  cancelOrder(orderId: string | number) {
    this.rejectOrder(orderId);
  }

  markAsReady(orderId: string | number) {
    console.log('🔍 Debug markAsReady orderId:', orderId, typeof orderId);
    
    if (!orderId || isNaN(Number(orderId))) {
      console.error('❌ Invalid orderId in markAsReady:', orderId);
      alert('Erreur: ID de commande invalide');
      return;
    }
    
    this.updateStatus(orderId, 'livrée');
  }

  canRejectOrder(status: string): boolean {
    // Admin peut seulement rejeter les commandes "en cours"
    return status === 'en cours';
  }

  canMarkAsReady(status: string): boolean {
    return status === 'en cours' || status === 'préparée' || status === 'livraison';
  }



  viewOrder(orderId: string | number) {
    const order = this.orders.find(o => o.id == orderId);
    if (order) {
      this.selectedOrder = order;
      this.showOrderDetails = true;
    }
  }

  closeOrderDetails() {
    this.showOrderDetails = false;
    this.selectedOrder = null;
  }

  printOrder(orderId: string | number) {
    const order = this.orders.find(o => o.id == orderId);
    if (order) {
      console.log('Admin printing order:', order);
      alert(`Printing order #${orderId} for ${order.userName}`);
    }
  }

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'en attente': '#f59e0b',     // Orange pour en attente
      'en cours': '#3b82f6',       // Bleu pour en cours
      'préparée': '#06b6d4',       // Cyan pour préparée
      'livraison': '#8b5cf6',      // Violet pour livraison
      'livrée': '#10b981',         // Vert pour livrée
      'annulée': '#e74c3c'         // Rouge pour annulée
    };
    return colors[status] || '#6b7280';
  }

  getStatusClass(status: string): string {
    const classes: { [key: string]: string } = {
      'en attente': 'en-attente',
      'en cours': 'en-cours',
      'préparée': 'preparee',
      'livraison': 'livraison',
      'livrée': 'livree',
      'annulée': 'annulee'
    };
    return classes[status] || '';
  }

  getStatusText(status: string): string {
    const texts: { [key: string]: string } = {
      'en attente': 'En Attente',
      'en cours': 'En Cours',
      'préparée': 'Préparée',
      'livraison': 'En Livraison',
      'livrée': 'Livrée',
      'annulée': 'Annulée'
    };
    return texts[status] || status;
  }

  // Helper methods for display
  getItemsText(items: OrderItem[]): string {
    if (!items || !Array.isArray(items)) return 'No items';
    return items.map(item => `${item.name} x${item.quantity}`).join(', ');
  }

  formatDate(date: Date | string): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  get totalOrderValue(): number {
    return this.filteredOrders.reduce((sum, order) => sum + order.total, 0);
  }

  // Track function for ngFor
  trackOrder(index: number, order: Order): number {
    return order.id;
  }
}