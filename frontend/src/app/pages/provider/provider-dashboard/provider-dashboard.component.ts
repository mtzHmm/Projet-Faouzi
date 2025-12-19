import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { OrderService, Order } from '../../../services/order.service';
import { ProductService } from '../../../services/product.service';

interface Stats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
}

@Component({
  selector: 'app-provider-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './provider-dashboard.component.html',
  styleUrl: './provider-dashboard.component.css'
})
export class ProviderDashboardComponent implements OnInit {
  userName = '';
  storeName = '';
  providerId: number | null = null;
  loading = true;
  stats: Stats = {
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0
  };

  constructor(
    private authService: AuthService,
    private orderService: OrderService,
    private productService: ProductService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadUserData();
    this.loadDashboardData();
    this.loadRecentOrders();
  }

  loadUserData() {
    const userData = this.authService.getUserData();
    if (userData) {
      this.userName = this.authService.getUserName();
      // For providers, the store name might be in different fields
      this.storeName = userData.storeName || userData.name || userData.nom || 'My Store';
      // Get provider ID
      this.providerId = this.authService.getProviderId();
      console.log('👤 Provider ID:', this.providerId);
    }
  }

  loadDashboardData() {
    if (!this.providerId) {
      console.error('❌ No provider ID found');
      this.loading = false;
      return;
    }

    // Load products count
    this.productService.getProducts({ store_id: this.providerId, limit: 1 }).subscribe({
      next: (response) => {
        this.stats.totalProducts = response.total;
        console.log('📦 Total products:', this.stats.totalProducts);
      },
      error: (error) => {
        console.error('❌ Error loading products:', error);
      }
    });

    // Load order stats
    this.orderService.getOrderStats(this.providerId).subscribe({
      next: (statsData) => {
        this.stats.totalOrders = statsData.totalOrders || 0;
        this.stats.totalRevenue = statsData.totalRevenue || 0;
        this.stats.pendingOrders = (statsData.waitingOrders || 0) + (statsData.preparedOrders || 0);
        console.log('📊 Stats loaded:', this.stats);
        this.loading = false;
      },
      error: (error) => {
        console.error('❌ Error loading stats:', error);
        this.loading = false;
      }
    });
  }

  loadRecentOrders() {
    if (!this.providerId) {
      console.warn('⚠️ Cannot load recent orders: No provider ID');
      return;
    }

    console.log('🔄 Loading recent orders for provider:', this.providerId);

    // Load recent orders for this provider
    this.orderService.getOrders({ 
      providerId: this.providerId, 
      limit: 5,
      page: 1
    }).subscribe({
      next: (response) => {
        console.log('📥 Raw orders response:', response);
        this.recentOrders = response.orders.map(order => ({
          id: order.id,
          customerName: order.userName || 'Unknown',
          items: order.items?.length || 0,
          total: order.total,
          status: order.status,
          createdAt: new Date(order.createdAt)
        }));
        console.log('📋 Recent orders loaded:', this.recentOrders.length);
        
        // Manually trigger change detection
        this.cdr.detectChanges();
        console.log('✨ Change detection triggered');
      },
      error: (error) => {
        console.error('❌ Error loading recent orders:', error);
        this.recentOrders = [];
        this.cdr.detectChanges();
      }
    });
  }

  quickActions = [
    { title: 'Ajouter Produit', route: '/provider/products', color: 'linear-gradient(135deg, #667eea, #764ba2)', icon: 'fas fa-plus' },
    { title: 'Gérer Stock', route: '/provider/inventory', color: 'linear-gradient(135deg, #f093fb, #f5576c)', icon: 'fas fa-boxes' },
    { title: 'Voir Commandes', route: '/provider/orders', color: 'linear-gradient(135deg, #4facfe, #00f2fe)', icon: 'fas fa-list-alt' },
    { title: 'Rapports', route: '/provider/reports', color: 'linear-gradient(135deg, #43e97b, #38f9d7)', icon: 'fas fa-chart-bar' }
  ];

  recentOrders: Array<{
    id: number;
    customerName: string;
    items: number;
    total: number;
    status: string;
    createdAt: Date;
  }> = [];

  getStatusColor(status: string): string {
    const normalizedStatus = status?.toLowerCase().replace(/\s+/g, '_');
    switch (normalizedStatus) {
      case 'en_attente': return '#fbbf24';
      case 'en_cours': return '#f59e0b';
      case 'préparée': return '#3b82f6';
      case 'en_livraison': return '#8b5cf6';
      case 'livrée': return '#10b981';
      case 'annulée': return '#ef4444';
      default: return '#6b7280';
    }
  }

  getStatusText(status: string): string {
    const normalizedStatus = status?.toLowerCase().replace(/\s+/g, '_');
    switch (normalizedStatus) {
      case 'en_attente': return 'En Attente';
      case 'en_cours': return 'En Cours';
      case 'préparée': return 'Préparée';
      case 'en_livraison': return 'En Livraison';
      case 'livrée': return 'Livrée';
      case 'annulée': return 'Annulée';
      default: return status || 'Unknown';
    }
  }

  getStatusClass(status: string): string {
    const normalizedStatus = status?.toLowerCase().replace(/\s+/g, '_');
    switch (normalizedStatus) {
      case 'en_attente': return 'en-attente';
      case 'en_cours': return 'en-cours';
      case 'préparée': return 'preparee';
      case 'en_livraison': return 'en-livraison';
      case 'livrée': return 'livree';
      case 'annulée': return 'annulee';
      default: return 'default';
    }
  }

  trackByOrderId(index: number, order: any): number {
    return order.id;
  }
}