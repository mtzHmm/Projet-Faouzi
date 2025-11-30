import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

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
export class ProviderDashboardComponent {
  stats: Stats = {
    totalProducts: 156,
    totalOrders: 324,
    totalRevenue: 15840,
    pendingOrders: 23
  };

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
      status: 'prepare',
      createdAt: new Date('2025-11-28T10:30:00')
    },
    {
      id: 2002,
      customerName: 'Jean Martin',
      items: 2,
      total: 28.50,
      status: 'nouveau',
      createdAt: new Date('2025-11-28T09:15:00')
    },
    {
      id: 2003,
      customerName: 'Sophie Laurent',
      items: 5,
      total: 67.20,
      status: 'prepare',
      createdAt: new Date('2025-11-28T08:45:00')
    }
  ];

  getStatusColor(status: string): string {
    switch (status) {
      case 'nouveau': return '#f39c12';
      case 'prepare': return '#3498db';
      case 'pret': return '#2ecc71';
      case 'annule': return '#e74c3c';
      default: return '#95a5a6';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'nouveau': return 'Nouveau';
      case 'prepare': return 'En préparation';
      case 'pret': return 'Prêt';
      case 'annule': return 'Annulé';
      default: return status;
    }
  }
}