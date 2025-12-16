import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface User {
  id: number;
  fullName: string;
  email: string;
  role: 'admin' | 'client' | 'provider' | 'delivery';
  phone: string;
  registrationDate: Date;
  status: 'active' | 'inactive' | 'suspended';
  totalOrders?: number;
  storeInfo?: {
    storeName: string;
    storeType: string;
    storeAddress: string;
  };
}

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, FormsModule],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.css'
})
export class UserManagementComponent {
  users: User[] = [
    {
      id: 1,
      fullName: 'hamam Mootaz',
      email: 'hamam.mootaz@email.com',
      role: 'admin',
      phone: '+216 98 765 432',
      registrationDate: new Date(2024, 0, 10),
      status: 'active',
      totalOrders: 12
    },
    {
      id: 2,
      fullName: 'jaafeer seif',
      email: 'jaafeer.seif@email.com',
      role: 'client',
      phone: '+216 22 334 455',
      registrationDate: new Date(2024, 0, 8),
      status: 'active',
      totalOrders: 8
    },
    {
      id: 3,
      fullName: 'Omar Khelifi',
      email: 'omar.khelifi@email.com',
      role: 'client',
      phone: '+216 55 667 788',
      registrationDate: new Date(2024, 0, 5),
      status: 'active',
      totalOrders: 15
    },
    {
      id: 4,
      fullName: 'Sarra Mansouri',
      email: 'sarra.mansouri@email.com',
      role: 'delivery',
      phone: '+216 77 889 900',
      registrationDate: new Date(2024, 0, 3),
      status: 'active',
      totalOrders: 87
    },
    {
      id: 5,
      fullName: 'Ahmed Ben Ali',
      email: 'ahmed.benali@email.com',
      role: 'client',
      phone: '+216 20 111 222',
      registrationDate: new Date(2024, 0, 1),
      status: 'active',
      totalOrders: 3
    },
    {
      id: 6,
      fullName: 'Mohamed Bella',
      email: 'mohamed.bella@email.com',
      role: 'provider',
      phone: '+216 70 123 456',
      registrationDate: new Date(2023, 11, 15),
      status: 'active',
      totalOrders: 45,
      storeInfo: {
        storeName: 'Bella Pizza',
        storeType: 'Restaurant',
        storeAddress: '123 Avenue Habib Bourguiba, Tunis'
      }
    },
    {
      id: 7,
      fullName: 'Dr. Fatma Sina',
      email: 'fatma.sina@email.com',
      role: 'provider',
      phone: '+216 71 234 567',
      registrationDate: new Date(2023, 11, 10),
      status: 'active',
      totalOrders: 78,
      storeInfo: {
        storeName: 'Pharmacie Ibn Sina',
        storeType: 'Pharmacie',
        storeAddress: '456 Rue de la Liberté, Sfax'
      }
    },
    {
      id: 8,
      fullName: 'Karim Urban',
      email: 'karim.urban@email.com',
      role: 'provider',
      phone: '+216 72 345 678',
      registrationDate: new Date(2023, 10, 20),
      status: 'active',
      totalOrders: 32,
      storeInfo: {
        storeName: 'Urban Fashion',
        storeType: 'Boutique',
        storeAddress: '789 Avenue Mohamed V, Sousse'
      }
    },
    {
      id: 9,
      fullName: 'Youssef Delivery',
      email: 'youssef.delivery@email.com',
      role: 'delivery',
      phone: '+216 25 456 789',
      registrationDate: new Date(2023, 11, 5),
      status: 'active',
      totalOrders: 234
    },
    {
      id: 10,
      fullName: 'Leila Express',
      email: 'leila.express@email.com',
      role: 'delivery',
      phone: '+216 26 567 890',
      registrationDate: new Date(2023, 10, 28),
      status: 'active',
      totalOrders: 189
    },
    {
      id: 11,
      fullName: 'Karim Fast',
      email: 'karim.fast@email.com',
      role: 'delivery',
      phone: '+216 27 678 901',
      registrationDate: new Date(2023, 10, 15),
      status: 'active',
      totalOrders: 156
    },
    {
      id: 12,
      fullName: 'Nadia Speed',
      email: 'nadia.speed@email.com',
      role: 'delivery',
      phone: '+216 28 789 012',
      registrationDate: new Date(2023, 9, 20),
      status: 'active',
      totalOrders: 203
    }
  ];

  searchTerm: string = '';
  selectedRole: string = 'all';

  get filteredUsers() {
    return this.users.filter(user => {
      const matchesSearch = user.fullName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                           user.email.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesRole = this.selectedRole === 'all' || user.role.toLowerCase() === this.selectedRole.toLowerCase();
      return matchesSearch && matchesRole;
    });
  }

  getRoleDisplayName(role: string): string {
    switch (role) {
      case 'admin': return 'Administrateur';
      case 'client': return 'Client';
      case 'provider': return 'Fournisseur';
      case 'delivery': return 'Livreur';
      default: return role;
    }
  }

  getStatusDisplayName(status: string): string {
    switch (status) {
      case 'active': return 'Actif';
      case 'inactive': return 'Inactif';
      case 'suspended': return 'Suspendu';
      default: return status;
    }
  }

  getStatusClass(status: string): string {
    return `status-${status}`;
  }

  getRoleClass(role: string): string {
    return `role-${role}`;
  }

  getRoleCount(role: 'admin' | 'client' | 'provider' | 'delivery'): number {
    return this.users.filter(user => user.role === role).length;
  }

  editUser(userId: number) {
    console.log('Edit user:', userId);
    // Implement edit functionality
  }

  changeUserRole(userId: number, newRole: 'admin' | 'client' | 'provider' | 'delivery') {
    const user = this.users.find(u => u.id === userId);
    if (user) {
      user.role = newRole;
      console.log(`User ${user.fullName} role changed to ${newRole}`);
    }
  }

  onRoleChange(userId: number, event: Event) {
    const select = event.target as HTMLSelectElement;
    if (select) {
      this.changeUserRole(userId, select.value as any);
    }
  }

  deleteUser(userId: number) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      this.users = this.users.filter(user => user.id !== userId);
    }
  }

  toggleUserStatus(userId: number) {
    const user = this.users.find(u => u.id === userId);
    if (user) {
      user.status = user.status === 'active' ? 'suspended' : 'active';
    }
  }

  addNewUser() {
    console.log('Add new user');
    // Implement add user functionality
  }
}