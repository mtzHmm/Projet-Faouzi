import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

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
  stats: Stats = {
    totalProducts: 156,
    totalOrders: 324,
    totalRevenue: 15840,
    pendingOrders: 23
  };

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.loadUserData();
  }

  loadUserData() {
    const userData = this.authService.getUserData();
    if (userData) {
      this.userName = this.authService.getUserName();
      // For providers, the store name might be in different fields
      this.storeName = userData.storeName || userData.name || userData.nom || 'My Store';
    }
  }

  quickActions = [
    { title: 'Ajouter Produit', route: '/provider/products', color: 'linear-gradient(135deg, #667eea, #764ba2)', icon: 'fas fa-plus' },
    { title: 'Gérer Stock', route: '/provider/inventory', color: 'linear-gradient(135deg, #f093fb, #f5576c)', icon: 'fas fa-boxes' },
    { title: 'Voir Commandes', route: '/provider/orders', color: 'linear-gradient(135deg, #4facfe, #00f2fe)', icon: 'fas fa-list-alt' },
    { title: 'Rapports', route: '/provider/reports', color: 'linear-gradient(135deg, #43e97b, #38f9d7)', icon: 'fas fa-chart-bar' }
  ];

  recentOrders = [
    {
      id: 2001,
      customerName: 'Marie Dubois',
      items: 3,
      total: 45.90,
      status: 'en_cours',
      createdAt: new Date('2025-11-28T10:30:00')
    },
    {
      id: 2002,
      customerName: 'Jean Martin',
      items: 2,
      total: 28.50,
      status: 'en_cours',
      createdAt: new Date('2025-11-28T09:15:00')
    },
    {
      id: 2003,
      customerName: 'Sophie Laurent',
      items: 5,
      total: 67.20,
      status: 'livrée',
      createdAt: new Date('2025-11-28T08:45:00')
    }
  ];

  getStatusColor(status: string): string {
    switch (status) {
      case 'en_cours': return '#f59e0b';
      case 'livrée': return '#10b981';
      case 'annulée': return '#e74c3c';
      default: return '#95a5a6';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'en_cours': return 'En Cours';
      case 'livrée': return 'Livrée';
      case 'annulée': return 'Annulée';
      default: return status;
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'en_cours': return 'en-cours';
      case 'livrée': return 'livree';
      case 'annulée': return 'annulee';
      default: return '';
    }
  }
}