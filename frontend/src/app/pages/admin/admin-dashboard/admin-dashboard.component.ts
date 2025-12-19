import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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

  recentOrders: Order[] = [];
  recentUsers: User[] = [];

  constructor(
    private adminService: AdminService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.isLoading = true;
    console.log('📊 Loading admin dashboard data...');
    
    this.adminService.getDashboardStats().subscribe({
      next: (data) => {
        console.log('✅ Dashboard data received:', data);
        
        this.stats = {
          totalUsers: data.totalUsers || 0,
          totalOrders: data.totalOrders || 0,
          totalRevenue: data.totalRevenue || 0,
          activeDeliveries: data.activeDeliveries || 0,
          pendingOrders: data.pendingOrders || 0
        };
        
        console.log('📊 Stats updated:', this.stats);
        
        this.recentOrders = (data.recentOrders || []).map(order => ({
          id: order.id,
          userId: order.userId || 0,
          userName: order.userName || 'Unknown',
          total: order.total || 0,
          status: order.status as any,
          createdAt: new Date(order.createdAt),
          items: order.items || 0
        }));
        
        this.recentUsers = (data.recentUsers || []).map(user => ({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role as any,
          status: user.status as any,
          createdAt: new Date(user.createdAt)
        }));
        
        console.log('📋 Orders:', this.recentOrders.length, 'Users:', this.recentUsers.length);
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        console.error('❌ Error loading dashboard data:', error);
        this.isLoading = false;
        this.cdr.detectChanges();
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