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
  
  // Edit functionality
  showEditModal = false;
  editingUser: any = null;
  editingUserId: number | null = null;
  saving = false;

  // Success/Error messages
  showSuccessMessage = false;
  successMessage = '';
  showErrorMessage = false;
  errorMessage = '';

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

  selectSpecialRole(role: string) {
    this.selectedRole = role;
    this.filterUsers();
  }

  // Refresh manuel
  refreshUsers() {
    console.log('🔄 Manual refresh requested');
    this.loadUsers();
  }

  editUser(userId: number) {
    console.log('Edit user:', userId);
    const user = this.users.find(u => u.id === userId);
    if (user) {
      this.editingUser = { ...user, userType: user.role };
      this.editingUserId = userId;
      this.showEditModal = true;
    }
  }

  closeEditModal() {
    this.showEditModal = false;
    this.editingUser = null;
    this.editingUserId = null;
    this.saving = false;
  }

  getEditModalTitle(): string {
    if (!this.editingUser) return '';
    return this.getUserTypeText(this.editingUser.userType);
  }

  async saveUser() {
    if (!this.editingUser || !this.editingUserId) return;
    
    this.saving = true;
    try {
      // Simulate API call for now
      console.log('Saving user:', this.editingUser);
      
      // Update local data
      const userIndex = this.users.findIndex(u => u.id === this.editingUserId);
      if (userIndex !== -1) {
        this.users[userIndex] = { ...this.users[userIndex], ...this.editingUser };
        this.filterUsers();
      }
      
      this.closeEditModal();
    } catch (error) {
      console.error('Error saving user:', error);
    } finally {
      this.saving = false;
    }
  }

  changeUserRole(userId: number, newRole: 'admin' | 'client' | 'provider' | 'delivery') {
    const user = this.users.find(u => u.id === userId);
    if (!user) {
      alert('Utilisateur introuvable');
      return;
    }
    
    // Vérifier si le changement de rôle est autorisé
    if (!this.isRoleChangeAllowed(user.role, newRole)) {
      alert('Ce changement de rôle n\'est pas autorisé. Seuls les rôles Client et Admin peuvent être échangés.');
      // Remettre la valeur précédente dans le select
      this.resetRoleSelect(userId, user.role);
      return;
    }
    
    const oldRole = user.role;
    console.log(`🔄 Changing user ${userId} role from ${oldRole} to ${newRole}`);
    
    // Confirmer le changement avec l'utilisateur
    if (!confirm(`Êtes-vous sûr de vouloir changer le rôle de ${user.fullName || user.name} de ${this.getRoleDisplayName(oldRole)} vers ${this.getRoleDisplayName(newRole)} ?`)) {
      this.resetRoleSelect(userId, oldRole);
      return;
    }
    
    // Mise à jour locale temporaire pour feedback immédiat
    const originalRole = user.role;
    user.role = newRole;
    this.filterUsers();
    
    // Appel API pour persister en base de données
    this.userService.updateUser(userId, { role: newRole }).subscribe({
      next: (response) => {
        console.log('✅ User role updated in database:', response);
        alert(`Rôle mis à jour avec succès pour ${user.fullName || user.name}`);
      },
      error: (error) => {
        console.error('❌ Error updating user role in database:', error);
        alert('Erreur lors de la mise à jour du rôle en base de données');
        
        // Rollback en cas d'erreur
        user.role = originalRole;
        this.resetRoleSelect(userId, originalRole);
        this.filterUsers();
      }
    });
  }

  // Vérifier si un changement de rôle est autorisé
  private isRoleChangeAllowed(currentRole: string, newRole: string): boolean {
    const allowedRoles = ['client', 'admin'];
    
    // Les rôles provider et delivery ne peuvent pas être changés
    if (currentRole === 'provider' || currentRole === 'delivery') {
      return false;
    }
    
    // Les nouveaux rôles provider et delivery ne sont pas autorisés
    if (newRole === 'provider' || newRole === 'delivery') {
      return false;
    }
    
    // Seuls client et admin peuvent être échangés
    return allowedRoles.includes(currentRole) && allowedRoles.includes(newRole);
  }

  // Vérifier si un utilisateur peut changer de rôle
  canChangeRole(user: any): boolean {
    return user.role === 'client' || user.role === 'admin';
  }

  // Remettre la valeur précédente dans le select
  private resetRoleSelect(userId: number, originalRole: string) {
    // Utiliser setTimeout pour s'assurer que le DOM est mis à jour
    setTimeout(() => {
      const selectElement = document.querySelector(`select[data-user-id="${userId}"]`) as HTMLSelectElement;
      if (selectElement) {
        selectElement.value = originalRole;
      }
    }, 0);
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

  formatDate(dateString: string | Date | undefined): string {
    if (!dateString) {
      return 'N/A';
    }
    try {
      const dateObj = dateString instanceof Date ? dateString : new Date(dateString);
      if (isNaN(dateObj.getTime())) {
        return 'N/A';
      }
      return dateObj.toLocaleDateString('fr-FR');
    } catch (error) {
      return 'N/A';
    }
  }

  getStatusCssClass(status: string): string {
    return `status-${status}`;
  }

  getRoleCssClass(role: string): string {
    return `role-${role}`;
  }

  // Legacy method names for template compatibility
  getStatusClass(status: string): string {
    return this.getStatusCssClass(status);
  }

  getRoleClass(role: string): string {
    return this.getRoleCssClass(role);
  }

  getUserCountByRole(role: string): number {
    return this.users.filter(user => user.role === role).length;
  }

  // Template compatibility method
  getRoleCount(role: 'admin' | 'client' | 'provider' | 'delivery'): number {
    return this.getUserCountByRole(role);
  }

  showSuccess(message: string) {
    this.successMessage = message;
    this.showSuccessMessage = true;
    this.showErrorMessage = false;
    setTimeout(() => {
      this.showSuccessMessage = false;
    }, 3000);
  }

  showError(message: string) {
    this.errorMessage = message;
    this.showErrorMessage = true;
    this.showSuccessMessage = false;
    setTimeout(() => {
      this.showErrorMessage = false;
    }, 5000);
  }

  hideSuccessMessage() {
    this.showSuccessMessage = false;
  }

  getUserTypeText(role: string): string {
    switch (role) {
      case 'client': return 'l\'utilisateur';
      case 'livreur': return 'le livreur';
      case 'magasin': return 'le magasin';
      default: return 'l\'utilisateur';
    }
  }

  isEditableRole(role: string): boolean {
    return ['client', 'livreur', 'magasin'].includes(role);
  }

  getFieldsForRole(role: string): string[] {
    switch (role) {
      case 'client':
        return ['email', 'name', 'adresse', 'telephone'];
      case 'livreur':
        return ['email', 'fullName', 'adresse', 'telephone', 'ville', 'vehicule'];
      case 'magasin':
        return ['email', 'nom', 'adresse', 'telephone', 'ville'];
      default:
        return ['email'];
    }
  }

  prepareUpdateData(userData: any): any {
    if (!userData || !userData.role) return userData;

    const data: any = {};
    const fieldsForRole = this.getFieldsForRole(userData.role);

    fieldsForRole.forEach(field => {
      if (userData.hasOwnProperty(field)) {
        data[field] = userData[field];
      }
    });

    return data;
  }

  isFieldRequired(field: string, role: string): boolean {
    const requiredFields = ['email'];
    return requiredFields.includes(field);
  }

  validateUserData(): boolean {
    // Implementation for validation
    return true;
  }

  private canEditRole(currentRole: string, newRole: string): boolean {
    const allowedRoles = ['client', 'admin'];
    
    if (!allowedRoles.includes(currentRole)) {
      return false;
    }
    
    if (!allowedRoles.includes(newRole)) {
      return false;
    }
    
    return allowedRoles.includes(currentRole) && allowedRoles.includes(newRole);
  }

  canEditUser(user: any): boolean {
    return user.role === 'client' || user.role === 'admin';
  }
}