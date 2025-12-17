import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UserService, User } from '../../services/user.service';

// Interface locale pour les fonctionnalités étendues
interface ExtendedUser extends User {
  fullName?: string;
  phone?: string;
  registrationDate?: Date;
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
export class UserManagementComponent implements OnInit, OnDestroy {
  users: ExtendedUser[] = [];
  filteredUsers: ExtendedUser[] = [];
  loading = false;
  error: string | null = null;
  
  // Filtres
  searchTerm = '';
  selectedRole = 'all';
  
  // Auto-refresh
  private refreshInterval: any;
  autoRefresh = true;

  constructor(private userService: UserService) {}

  ngOnInit() {
    this.loadUsers();
    
    // Auto-refresh every 30 seconds
    if (this.autoRefresh) {
      this.refreshInterval = setInterval(() => {
        console.log('🔄 Auto-refreshing users...');
        this.loadUsers(true); // Silent refresh
      }, 30000);
    }
  }
  
  ngOnDestroy() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  loadUsers(silent = false) {
    if (!silent) {
      this.loading = true;
      this.error = null;
    }
    
    console.log('🔄 Loading users from database...');
    
    this.userService.getUsers().subscribe({
      next: (response) => {
        console.log('📊 Users response:', response);
        
        // Traitement en lot de toutes les données
        const processedUsers = this.processUsersData(response.users);
        
        // Mise à jour atomique
        this.users = processedUsers;
        this.filterUsers();
        
        if (!silent) {
          this.loading = false;
        }
        
        console.log(`✅ Loaded ${this.users.length} users from database`);
      },
      error: (error) => {
        console.error('❌ Error loading users:', error);
        if (!silent) {
          this.error = 'Failed to load users. Please try again.';
          this.loading = false;
        }
        
        // Fallback vers des données mock en cas d'erreur
        if (this.users.length === 0) {
          this.loadMockUsers();
        }
      }
    });
  }
  
  // Traitement optimisé des données utilisateurs
  private processUsersData(rawUsers: any[]): ExtendedUser[] {
    return rawUsers.map(user => {
      // Création de la date de manière sécurisée
      let registrationDate: Date;
      try {
        registrationDate = user.createdAt ? new Date(user.createdAt) : new Date();
        if (isNaN(registrationDate.getTime())) {
          registrationDate = new Date();
        }
      } catch {
        registrationDate = new Date();
      }
      
      return {
        ...user,
        fullName: user.name || (user.nom + ' ' + (user.prenom || '')).trim(),
        registrationDate: registrationDate,
        totalOrders: 0, // Par défaut, sera mis à jour plus tard
        phone: user.tel ? user.tel.toString() : '',
      };
    });
  }

  loadMockUsers() {
    console.log('⚠️ Using fallback mock data - database connection failed');
    
    this.users = [
      {
        id: 1,
        name: 'hamam Mootaz',
        fullName: 'hamam Mootaz',
        email: 'hamam.mootaz@email.com',
        role: 'admin',
        phone: '+216 98 765 432',
        registrationDate: new Date(2024, 0, 10),
        status: 'active',
        totalOrders: 12,
        createdAt: new Date(2024, 0, 10)
      },
      {
        id: 2,
        name: 'jaafeer seif',
        fullName: 'jaafeer seif',
        email: 'jaafeer.seif@email.com',
        role: 'client',
        phone: '+216 22 334 455',
        registrationDate: new Date(2024, 0, 8),
        status: 'active',
        totalOrders: 8,
        createdAt: new Date(2024, 0, 8)
      }
    ];
    
    this.filterUsers();
  }

  filterUsers() {
    if (!this.users || this.users.length === 0) {
      this.filteredUsers = [];
      return;
    }
    
    let filtered = [...this.users];

    // Filtre de recherche
    if (this.searchTerm && this.searchTerm.trim()) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(user => {
        const fullName = user.fullName || user.name || '';
        const email = user.email || '';
        return fullName.toLowerCase().includes(searchLower) ||
               email.toLowerCase().includes(searchLower);
      });
    }

    // Filtre de rôle
    if (this.selectedRole && this.selectedRole !== 'all') {
      filtered = filtered.filter(user => user.role === this.selectedRole);
    }

    this.filteredUsers = filtered;
    console.log(`🔍 Filtered ${this.filteredUsers.length}/${this.users.length} users`);
  }

  // Méthodes réactives pour les filtres
  onSearchChange() {
    this.filterUsers();
  }
  
  onRoleFilterChange() {
    this.filterUsers();
  }

  // Refresh manuel
  refreshUsers() {
    console.log('🔄 Manual refresh requested');
    this.loadUsers();
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

  // Méthode pour formater les dates de manière sécurisée
  formatDate(date: any): string {
    if (!date) return 'N/A';
    
    try {
      const dateObj = date instanceof Date ? date : new Date(date);
      if (isNaN(dateObj.getTime())) return 'N/A';
      
      return dateObj.toLocaleDateString('fr-FR');
    } catch (error) {
      return 'N/A';
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