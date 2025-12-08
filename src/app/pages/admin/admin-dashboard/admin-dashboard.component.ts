import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';

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
  status: 'en_attente' | 'prepare' | 'en_livraison' | 'livre' | 'annule';
  createdAt: Date;
  items: number;
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
export class AdminDashboardComponent {
  stats: Stats = {
    totalUsers: 1847,
    totalOrders: 3421,
    totalRevenue: 87456.50,
    activeDeliveries: 23,
    pendingOrders: 12
  };

  recentOrders: Order[] = [
    {
      id: 1001,
      userId: 123,
      userName: 'Sophie Martin',
      total: 45.80,
      status: 'en_livraison',
      createdAt: new Date('2025-11-28T14:30:00'),
      items: 3
    },
    {
      id: 1002,
      userId: 456,
      userName: 'Marc Dubois',
      total: 28.90,
      status: 'prepare',
      createdAt: new Date('2025-11-28T14:25:00'),
      items: 2
    },
    {
      id: 1003,
      userId: 789,
      userName: 'Laura Petit',
      total: 67.30,
      status: 'en_attente',
      createdAt: new Date('2025-11-28T14:20:00'),
      items: 5
    },
    {
      id: 1004,
      userId: 321,
      userName: 'Thomas Bernard',
      total: 15.40,
      status: 'livre',
      createdAt: new Date('2025-11-28T13:45:00'),
      items: 1
    },
    {
      id: 1005,
      userId: 654,
      userName: 'Emma Rousseau',
      total: 92.10,
      status: 'en_livraison',
      createdAt: new Date('2025-11-28T13:30:00'),
      items: 7
    }
  ];

  recentUsers: User[] = [
    {
      id: 123,
      name: 'Sophie Martin',
      email: 'sophie.martin@email.com',
      role: 'client',
      status: 'actif',
      createdAt: new Date('2025-11-27T10:15:00')
    },
    {
      id: 456,
      name: 'Marc Dubois',
      email: 'marc.dubois@email.com',
      role: 'livreur',
      status: 'actif',
      createdAt: new Date('2025-11-26T16:20:00')
    },
    {
      id: 789,
      name: 'Laura Petit',
      email: 'laura.petit@email.com',
      role: 'client',
      status: 'actif',
      createdAt: new Date('2025-11-25T09:30:00')
    },
    {
      id: 321,
      name: 'Thomas Bernard',
      email: 'thomas.bernard@email.com',
      role: 'client',
      status: 'inactif',
      createdAt: new Date('2025-11-24T14:45:00')
    }
  ];

  quickActions = [
    { icon: 'fas fa-plus', title: 'Ajouter Produit', route: '/admin/products/add', color: '#3498db' },
    { icon: 'fas fa-user-plus', title: 'Nouveau Livreur', route: '/admin/users/add', color: '#2ecc71' },
    { icon: 'fas fa-chart-bar', title: 'Rapports', route: '/admin/reports', color: '#e74c3c' },
    { icon: 'fas fa-cog', title: 'Paramètres', route: '/admin/settings', color: '#f39c12' }
  ];

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
      case 'en_attente': return 'en-attente';
      case 'prepare': return 'en-preparation';
      case 'en_livraison': return 'en-livraison';
      case 'livre': return 'livre';
      case 'annule': return 'annule';
      default: return '';
    }
  }
}