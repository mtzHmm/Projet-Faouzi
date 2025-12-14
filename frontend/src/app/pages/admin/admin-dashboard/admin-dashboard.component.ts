import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'client' | 'livreur' | 'admin';
  status: 'actif' | 'inactif';
  createdAt: Date;
}

interface Order {
  id: number;
  userId: number;
  userName: string;
  total: number;
  status: 'en_cours' | 'livrée' | 'annulée';
  createdAt: Date;
  items: number;
}

interface Delivery {
  id: number;
  orderId: number;
  livreurId: number;
  status: 'en_attente' | 'en_préparation' | 'préparée' | 'annulée' | 'en_livraison' | 'livrée';
  createdAt: Date;
}

interface Stats {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  activeDeliveries: number;
  pendingOrders: number;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, FormsModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent implements OnInit {
  stats: Stats = {
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    activeDeliveries: 0,
    pendingOrders: 0
  };

  isLoading = true;

  recentOrders: Order[] = [
    {
      id: 1001,
      userId: 123,
      userName: 'Sophie Martin',
      total: 45.80,
      status: 'en_cours',
      createdAt: new Date('2025-11-28T14:30:00'),
      items: 3
    },
    {
      id: 1002,
      userId: 456,
      userName: 'Marc Dubois',
      total: 28.90,
      status: 'en_cours',
      createdAt: new Date('2025-11-28T14:25:00'),
      items: 2
    },
    {
      id: 1003,
      userId: 789,
      userName: 'Laura Petit',
      total: 67.30,
      status: 'en_cours',
      createdAt: new Date('2025-11-28T14:20:00'),
      items: 5
    },
    {
      id: 1004,
      userId: 321,
      userName: 'Thomas Bernard',
      total: 15.40,
      status: 'livrée',
      createdAt: new Date('2025-11-28T13:45:00'),
      items: 1
    },
    {
      id: 1005,
      userId: 654,
      userName: 'Emma Rousseau',
      total: 92.10,
      status: 'annulée',
      createdAt: new Date('2025-11-28T13:30:00'),
      items: 7
    }
  ];

  recentUsers: User[] = [];

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.isLoading = true;
    this.adminService.getDashboardStats().subscribe({
      next: (data) => {
        this.stats = {
          totalUsers: data.totalUsers,
          totalOrders: data.totalOrders,
          totalRevenue: data.totalRevenue,
          activeDeliveries: data.activeDeliveries,
          pendingOrders: data.pendingOrders
        };
        this.recentOrders = data.recentOrders as any;
        this.recentUsers = data.recentUsers as any;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading dashboard data:', error);
        this.isLoading = false;
      }
    });
  }

  quickActions = [
    { icon: 'fas fa-plus', title: 'Ajouter Produit', route: '/admin/products/add', color: '#3498db' },
    { icon: 'fas fa-user-plus', title: 'Nouveau Livreur', route: '/admin/users/add', color: '#2ecc71' },
    { icon: 'fas fa-chart-bar', title: 'Rapports', route: '/admin/reports', color: '#e74c3c' },
    { icon: 'fas fa-cog', title: 'Paramètres', route: '/admin/settings', color: '#f39c12' }
  ];

  getStatusColor(status: string): string {
    switch (status) {
      case 'en_cours': return '#f59e0b';
      case 'livrée': return '#10b981';
      case 'annulée': return '#e74c3c';
      default: return '#95a5a6';
    }
  }

  getDeliveryStatusColor(status: string): string {
    switch (status) {
      case 'en_attente': return '#f59e0b';
      case 'en_préparation': return '#3b82f6';
      case 'préparée': return '#8b5cf6';
      case 'en_livraison': return '#f97316';
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

  getDeliveryStatusText(status: string): string {
    switch (status) {
      case 'en_attente': return 'En Attente';
      case 'en_préparation': return 'En Préparation';
      case 'préparée': return 'Préparée';
      case 'en_livraison': return 'En Livraison';
      case 'livrée': return 'Livrée';
      case 'annulée': return 'Annulée';
      default: return status;
    }
  }

  getRoleColor(role: string): string {
    switch (role) {
      case 'admin': return '#e74c3c';
      case 'livreur': return '#3498db';
      case 'client': return '#14b8a6';
      default: return '#95a5a6';
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

  getDeliveryStatusClass(status: string): string {
    switch (status) {
      case 'en_attente': return 'en-attente';
      case 'en_préparation': return 'en-preparation';
      case 'préparée': return 'preparee';
      case 'en_livraison': return 'en-livraison';
      case 'livrée': return 'livree';
      case 'annulée': return 'annulee';
      default: return '';
    }
  }
}