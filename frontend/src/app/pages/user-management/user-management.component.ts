import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UserService, User } from '../../services/user.service';

// Interface locale pour les fonctionnalités étendues
interface ExtendedUser extends User {
  fullName?: string;
  phone?: string;
  tel?: string;
  firstName?: string;
  prenom?: string;
  nom?: string;
  userType?: string;
  gouvernorat?: string;
  ville?: string;
  registrationDate?: Date;
  totalOrders?: number;
  tableType?: 'client' | 'magasin' | 'livreur'; // Add table identifier
  
  // Table-specific ID fields
  id_client?: number;
  id_magazin?: number;
  id_liv?: number;
  
  // Client fields
  gouv_client?: string;
  ville_client?: string;
  
  // Provider/Magasin fields
  type?: string;
  gouv_magasin?: string;
  ville_magasin?: string;
  
  // Delivery/Livreur fields
  vehicule?: string;
  ville_livraison?: string;
  gouv_livreur?: string;
  
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
  // Separate arrays for each user type
  clients: ExtendedUser[] = [];
  providers: ExtendedUser[] = [];
  deliveryUsers: ExtendedUser[] = [];
  
  // Filtered arrays
  filteredClients: ExtendedUser[] = [];
  filteredProviders: ExtendedUser[] = [];
  filteredDeliveryUsers: ExtendedUser[] = [];
  
  loading = false;
  error: string | null = null;
  
  // Active table view
  activeTable: 'clients' | 'providers' | 'delivery' = 'clients';
  
  // Filtres
  searchTerm = '';
  
  // Auto-refresh
  private refreshInterval: any;
  autoRefresh = true;
  
  // Edit functionality
  showEditModal = false;
  editingUser: any = null;
  editingUserId: number | null = null;
  editingUserType: string | undefined = undefined;  // Will be 'client', 'magasin', or 'livreur'
  saving = false;

  // Success/Error messages
  showSuccessMessage = false;
  successMessage = '';
  showErrorMessage = false;
  errorMessage = '';
  
  // Order history
  showOrderHistoryModal = false;
  orderHistoryUser: any = null;
  userOrders: any[] = [];
  loadingOrders = false;
  
  // Delete confirmation modal
  showDeleteConfirmModal = false;
  deleteConfirmUserId: number | null = null;
  deleteConfirmTableType: string | null = null;
  deleteConfirmUserName: string = '';

  constructor(
    private userService: UserService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadAllUserTypes();
    
    // Auto-refresh every 30 seconds
    if (this.autoRefresh) {
      this.refreshInterval = setInterval(() => {
        console.log('🔄 Auto-refreshing users...');
        this.loadAllUserTypes(true); // Silent refresh
      }, 30000);
    }
  }
  
  ngOnDestroy() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  loadAllUserTypes(silent = false) {
    if (!silent) {
      this.loading = true;
      this.error = null;
    }
    
    console.log('🔄 Loading all user types from database...');
    
    this.userService.getUsers().subscribe({
      next: (response) => {
        console.log('📊 Raw Users response:', response);
        
        if (response && response.users && Array.isArray(response.users)) {
          this.separateUsersByType(response.users);
          
          if (!silent) {
            this.loading = false;
          }
          
          this.cdr.detectChanges();
          console.log(`✅ Loaded users: ${this.clients.length} clients, ${this.providers.length} providers, ${this.deliveryUsers.length} delivery`);
        } else {
          console.warn('⚠️ Invalid response format:', response);
          this.loadMockUsers();
        }
      },
      error: (error) => {
        console.error('❌ Error loading users:', error);
        
        if (!silent) {
          this.error = 'Failed to load users. Please try again.';
          this.loading = false;
        }
        
        console.log('🔄 Loading mock data as fallback...');
        this.loadMockUsers();
      }
    });
  }

  private separateUsersByType(rawUsers: any[]) {
    this.clients = [];
    this.providers = [];
    this.deliveryUsers = [];

    rawUsers.forEach(user => {
      const processedUser = this.processUserData(user);
      
      console.log('🔍 Raw user data for classification:', {
        id: user.id,
        name: user.name || user.nom,
        hasVehicule: user.vehicule !== undefined,
        hasVilleLivraison: user.ville_livraison !== undefined,
        hasGouvLivreur: user.gouv_livreur !== undefined,
        hasType: user.type !== undefined,
        hasGouvMagasin: user.gouv_magasin !== undefined,
        hasVilleMagasin: user.ville_magasin !== undefined,
        hasIdLiv: user.id_liv !== undefined,
        hasIdMagazin: user.id_magazin !== undefined,
        hasIdClient: user.id_client !== undefined,
        allFields: Object.keys(user)
      });
      
      // Use database ID fields as primary indicator, fallback to field presence
      if (user.id_liv !== undefined) {
        // Definitely from livreur table
        processedUser.role = 'delivery';
        processedUser.tableType = 'livreur';
        this.deliveryUsers.push(processedUser);
        console.log(`🚚 Added to delivery (id_liv): ${processedUser.fullName}`);
      } else if (user.id_magazin !== undefined) {
        // Definitely from magasin table
        processedUser.role = 'provider';
        processedUser.tableType = 'magasin';
        this.providers.push(processedUser);
        console.log(`🏪 Added to providers (id_magazin): ${processedUser.fullName}`);
      } else if (user.id_client !== undefined) {
        // Definitely from client table
        processedUser.role = user.role?.toLowerCase() === 'admin' ? 'admin' : 'client';
        processedUser.tableType = 'client';
        this.clients.push(processedUser);
        console.log(`👤 Added to clients (id_client): ${processedUser.fullName} (${processedUser.role})`);
      } else {
        // Fallback to field presence detection (old logic)
        if (user.vehicule !== undefined || user.ville_livraison !== undefined || user.gouv_livreur !== undefined) {
          processedUser.role = 'delivery';
          processedUser.tableType = 'livreur';
          this.deliveryUsers.push(processedUser);
          console.log(`🚚 Added to delivery (fields): ${processedUser.fullName}`);
        } else if (user.type !== undefined || user.gouv_magasin !== undefined || user.ville_magasin !== undefined) {
          processedUser.role = 'provider';
          processedUser.tableType = 'magasin';
          this.providers.push(processedUser);
          console.log(`🏪 Added to providers (fields): ${processedUser.fullName}`);
        } else {
          processedUser.role = user.role?.toLowerCase() === 'admin' ? 'admin' : 'client';
          processedUser.tableType = 'client';
          this.clients.push(processedUser);
          console.log(`👤 Added to clients (default): ${processedUser.fullName} (${processedUser.role})`);
        }
      }
    });

    // Apply filters to each array
    this.filterUsers();
  }

  private processUserData(user: any): ExtendedUser {
    let registrationDate: Date;
    try {
      registrationDate = user.createdAt ? new Date(user.createdAt) : new Date();
      if (isNaN(registrationDate.getTime())) {
        registrationDate = new Date();
      }
    } catch {
      registrationDate = new Date();
    }
    
    // Preserve table-specific IDs in the processed user
    const processedUser: ExtendedUser = {
      ...user,
      fullName: user.name || (user.nom + ' ' + (user.prenom || '')).trim(),
      registrationDate: registrationDate,
      totalOrders: 0,
      phone: user.tel ? user.tel.toString() : '',
    };
    
    // Ensure table-specific IDs are preserved
    if (user.id_client) processedUser.id_client = user.id_client;
    if (user.id_magazin) processedUser.id_magazin = user.id_magazin;
    if (user.id_liv) processedUser.id_liv = user.id_liv;
    
    return processedUser;
  }

  private loadMockUsers() {
    this.clients = [
      {
        id: 1,
        name: 'Jean Dupont',
        nom: 'Dupont',
        prenom: 'Jean',
        email: 'jean.dupont@email.com',
        tel: '0123456789',
        role: 'client',
        status: 'active',
        createdAt: new Date(),
        tableType: 'client',
        fullName: 'Jean Dupont',
        registrationDate: new Date(),
        totalOrders: 5,
        phone: '0123456789'
      }
    ];

    this.providers = [
      {
        id: 1,
        name: 'Pharmacie Central',
        nom: 'Pharmacie Central',
        email: 'contact@pharmacie-central.fr',
        tel: '0223456789',
        type: 'Pharmacie',
        gouv_magasin: 'Tunis',
        role: 'provider',
        status: 'active',
        createdAt: new Date(),
        tableType: 'magasin',
        fullName: 'Pharmacie Central',
        registrationDate: new Date(),
        totalOrders: 25,
        phone: '0223456789'
      }
    ];

    this.deliveryUsers = [
      {
        id: 1,
        name: 'Ahmed Mokhtar',
        nom: 'Mokhtar',
        prenom: 'Ahmed',
        email: 'ahmed.livreur@email.com',
        tel: '0323456789',
        vehicule: 'Moto',
        ville_livraison: 'Tunis Centre',
        role: 'delivery',
        status: 'active',
        createdAt: new Date(),
        tableType: 'livreur',
        fullName: 'Ahmed Mokhtar',
        registrationDate: new Date(),
        totalOrders: 150,
        phone: '0323456789'
      }
    ];

    console.log('🔄 Mock data loaded separated by tables');
    this.filterUsers();
    this.loading = false;
  }

  filterUsers() {
    // Filter each user type array separately
    this.filteredClients = this.filterUserArray(this.clients);
    this.filteredProviders = this.filterUserArray(this.providers);
    this.filteredDeliveryUsers = this.filterUserArray(this.deliveryUsers);
    
    console.log(`🔍 Filtered - Clients: ${this.filteredClients.length}, Providers: ${this.filteredProviders.length}, Delivery: ${this.filteredDeliveryUsers.length}`);
  }

  private filterUserArray(users: ExtendedUser[]): ExtendedUser[] {
    if (!users || users.length === 0) {
      return [];
    }
    
    let filtered = [...users];

    if (this.searchTerm && this.searchTerm.trim()) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(user => {
        const fullName = user.fullName || user.name || '';
        const email = user.email || '';
        return fullName.toLowerCase().includes(searchLower) ||
               email.toLowerCase().includes(searchLower);
      });
    }

    // For individual table filtering, we can add specific filters
    return filtered;
  }

  onSearchChange() {
    this.filterUsers();
    this.cdr.detectChanges();
  }
  
  switchTable(table: 'clients' | 'providers' | 'delivery') {
    console.log('🔄 Switching to table:', table);
    this.activeTable = table;
    this.filterUsers();
    this.cdr.detectChanges();
  }

  refreshUsers() {
    console.log('🔄 Manual refresh requested');
    this.loadAllUserTypes();
  }

  editUser(userId: number, tableType: string) {
    console.log('✏️ Edit user:', userId, 'from table:', tableType);
    console.log('🔍 Active table view:', this.activeTable);
    
    let user;
    let actualUserId = userId;
    let actualTableType = tableType;
    
    // Find the user based on the specified table type to avoid ID conflicts
    switch (tableType) {
      case 'magasin':
        // Look in providers array using id_magazin
        user = this.providers.find(u => u.id_magazin === userId || u.id === userId);
        if (user) {
          actualTableType = 'magasin';
          actualUserId = user.id_magazin || userId;
          console.log('🏪 Found provider in magasin table - using id_magazin:', actualUserId);
        }
        break;
        
      case 'livreur':
        // Look in delivery array using id_liv
        user = this.deliveryUsers.find(u => u.id_liv === userId || u.id === userId);
        if (user) {
          actualTableType = 'livreur';
          actualUserId = user.id_liv || userId;
          console.log('🚚 Found delivery user in livreur table - using id_liv:', actualUserId);
        }
        break;
        
      case 'client':
        // Look in clients array using id_client
        user = this.clients.find(u => u.id_client === userId || u.id === userId);
        if (user) {
          actualTableType = 'client';
          actualUserId = user.id_client || userId;
          console.log('👤 Found client in client table - using id_client:', actualUserId);
        }
        break;
        
      default:
        console.error('❌ Unknown table type:', tableType);
        return;
    }
    
    if (!user) {
      console.error('❌ User not found:', userId, 'in table:', tableType);
      return;
    }

    console.log('📝 Original user data:', user);
    console.log('🔍 User role from database:', user.role);
    console.log('🔍 Table type:', user.tableType);
    console.log('🔍 Available ID fields:', {
      id: user.id,
      id_client: user.id_client,
      id_magazin: user.id_magazin,
      id_liv: user.id_liv
    });
    console.log('🔑 Using table-specific ID:', actualUserId, 'for table:', actualTableType);
    console.log('🎯 Table mapping - Input:', tableType, '-> Backend:', actualTableType);
    
    // Determine user type based on actual table
    let userType = 'client';
    switch (actualTableType) {
      case 'client':
        userType = user.role === 'admin' ? 'admin' : 'client';
        break;
      case 'magasin':
        userType = 'provider';
        break;
      case 'livreur':
        userType = 'delivery';
        break;
    }
    
    console.log('✅ Final detected userType:', userType);
    
    // Map exact database fields based on detected user type
    this.editingUser = {
      id: actualUserId,  // Use table-specific ID
      userType: userType,
      email: user.email,
      tableType: actualTableType  // Use the corrected table type
    };
    
    // Map table-specific fields exactly as they are in database
    if (userType === 'client' || userType === 'admin') {
      this.editingUser = {
        ...this.editingUser,
        nom: user.nom || '',
        prenom: user.prenom || '',
        tel: user.tel || null,
        role: user.role?.toUpperCase() || 'CLIENT',
        gouv_client: user.gouv_client || '',
        ville_client: user.ville_client || ''
      };
      console.log('📋 CLIENT/ADMIN fields mapped');
    } else if (userType === 'delivery') {
      this.editingUser = {
        ...this.editingUser,
        nom: user.nom || '',
        prenom: user.prenom || '',
        tel: user.tel || null,
        vehicule: user.vehicule || '',
        ville_livraison: user.ville_livraison || '',
        gouv_livreur: user.gouv_livreur || ''
      };
      console.log('🚚 DELIVERY fields mapped');
    } else if (userType === 'provider') {
      this.editingUser = {
        ...this.editingUser,
        nom: user.name || user.fullName || user.nom || '',
        tel: user.tel || null,
        type: user.type || '',
        gouv_magasin: user.gouv_magasin || '',
        ville_magasin: user.ville_magasin || ''
      };
      console.log('🏪 PROVIDER fields mapped');
    }
    
    this.editingUserId = actualUserId;  // Store the table-specific ID
    this.editingUserType = actualTableType;  // Store corrected table type (client/magasin/livreur)
    this.showEditModal = true;
    
    console.log('📝 Edit form data mapped to database structure:', this.editingUser);
    console.log('✅ Final userType set to:', this.editingUser.userType);
    console.log('🔑 FINAL - Using ID for backend:', actualUserId, 'for table:', actualTableType);
    console.log('🎯 FINAL - editingUserType set to:', actualTableType);
    console.log('🏪 PROVIDERS WILL USE MAGASIN TABLE - Confirmed!');
  }

  deleteUser(userId: number, tableType: string) {
    console.log('🗑️ Delete user:', userId, 'from table:', tableType);
    
    // Find user name for confirmation
    let user: ExtendedUser | undefined;
    if (tableType === 'client') {
      user = this.clients.find(u => u.id === userId || u.id_client === userId);
    } else if (tableType === 'magasin') {
      user = this.providers.find(u => u.id === userId || u.id_magazin === userId);
    } else if (tableType === 'livreur') {
      user = this.deliveryUsers.find(u => u.id === userId || u.id_liv === userId);
    }
    
    this.deleteConfirmUserName = user?.nom || user?.name || user?.email || 'cet utilisateur';
    this.deleteConfirmUserId = userId;
    this.deleteConfirmTableType = tableType;
    this.showDeleteConfirmModal = true;
  }
  
  confirmDelete() {
    if (!this.deleteConfirmUserId || !this.deleteConfirmTableType) return;
    
    const userId = this.deleteConfirmUserId;
    const tableType = this.deleteConfirmTableType;
    
    this.showDeleteConfirmModal = false;
    this.loading = true;
    
    this.userService.deleteUser(userId, tableType).subscribe({
      next: (response) => {
        console.log('✅ User deleted successfully:', response);
        
        this.showSuccessMessage = true;
        this.successMessage = 'Utilisateur supprimé avec succès';
        this.loading = false;
        
        // Refresh all users to show updated data
        this.loadAllUserTypes();
        
        setTimeout(() => {
          this.showSuccessMessage = false;
        }, 3000);
      },
      error: (error) => {
        console.error('❌ Error deleting user:', error);
        this.showErrorMessage = true;
        this.errorMessage = 'Erreur lors de la suppression de l\'utilisateur';
        this.loading = false;
        
        setTimeout(() => {
          this.showErrorMessage = false;
        }, 4000);
      }
    });
    
    // Reset confirmation data
    this.deleteConfirmUserId = null;
    this.deleteConfirmTableType = null;
    this.deleteConfirmUserName = '';
  }
  
  cancelDelete() {
    this.showDeleteConfirmModal = false;
    this.deleteConfirmUserId = null;
    this.deleteConfirmTableType = null;
    this.deleteConfirmUserName = '';
  }

  closeEditModal() {
    this.showEditModal = false;
    this.editingUser = null;
    this.editingUserId = null;
    this.editingUserType = undefined;
    this.saving = false;
  }
  
  viewOrderHistory(user: ExtendedUser) {
    console.log('📦 Viewing order history for user:', user);
    console.log('🔑 User ID being used:', user.id_client || user.id);
    console.log('🔍 User object:', JSON.stringify(user, null, 2));
    this.orderHistoryUser = user;
    this.showOrderHistoryModal = true;
    this.loadUserOrders(user.id_client || user.id);
  }
  
  loadUserOrders(userId: number) {
    console.log('📊 Loading orders for userId:', userId);
    this.loadingOrders = true;
    this.userOrders = [];
    
    this.userService.getUserOrders(userId).subscribe({
      next: (orders) => {
        console.log('✅ Orders loaded successfully:', orders);
        console.log('📦 Number of orders:', orders?.length);
        this.userOrders = orders || [];
        this.loadingOrders = false;
      },
      error: (error) => {
        console.error('❌ Error loading orders:', error);
        console.error('🔍 Error details:', JSON.stringify(error, null, 2));
        this.showErrorMessage = true;
        this.errorMessage = 'Erreur lors du chargement des commandes';
        this.loadingOrders = false;
        
        setTimeout(() => {
          this.showErrorMessage = false;
        }, 4000);
      }
    });
  }
  
  closeOrderHistoryModal() {
    this.showOrderHistoryModal = false;
    this.orderHistoryUser = null;
    this.userOrders = [];
  }
  
  getStatusClass(status: string): string {
    const statusMap: { [key: string]: string } = {
      'en attente': 'status-pending',
      'en cours': 'status-processing',
      'préparée': 'status-prepared',
      'livraison': 'status-delivery',
      'livrée': 'status-delivered',
      'annulée': 'status-cancelled'
    };
    return statusMap[status] || 'status-default';
  }
  
  getStatusLabel(status: string): string {
    const statusLabels: { [key: string]: string } = {
      'en attente': 'En attente',
      'en cours': 'En cours',
      'préparée': 'Préparée',
      'livraison': 'En livraison',
      'livrée': 'Livrée',
      'annulée': 'Annulée'
    };
    return statusLabels[status] || status;
  }
  
  get deliveredOrdersCount(): number {
    return this.userOrders.filter(o => o.status === 'livrée').length;
  }
  
  get totalSpent(): number {
    return this.userOrders.reduce((sum, order) => sum + (order.total || 0), 0);
  }

  getEditModalTitle(): string {
    if (!this.editingUser) return 'Modifier l\'utilisateur';
    switch(this.editingUser.userType) {
      case 'admin': return 'Modifier l\'administrateur';
      case 'client': return 'Modifier le client';
      case 'delivery': return 'Modifier le livreur';
      case 'provider': return 'Modifier le fournisseur';
      default: return 'Modifier l\'utilisateur';
    }
  }

  saveUser() {
    if (!this.editingUser || !this.editingUserId) return;
    
    this.saving = true;
    
    console.log('💾 Saving user to database:', this.editingUser);
    console.log('🔍 User role/type:', this.editingUser.userType, this.editingUser.role);
    console.log('🎯 Backend will use - ID:', this.editingUserId, 'UserType:', this.editingUser.userType, 'Table:', this.editingUserType);
    console.log('🔑 CRITICAL: Using table type for backend:', this.editingUserType);
    
    // Use the actual table type (client/magasin/livreur) instead of logical type (client/provider/delivery)
    this.userService.updateUser(this.editingUserId, this.editingUser, this.editingUserType).subscribe({
      next: (response) => {
        console.log('✅ User updated successfully:', response);
        
        // Show success notification immediately
        this.showSuccessMessage = true;
        this.successMessage = 'Utilisateur mis à jour avec succès';
        this.saving = false;
        
        // Update the user in the appropriate array using table-specific ID
        if (this.editingUserType === 'client') {
          const userIndex = this.clients.findIndex((u: ExtendedUser) => {
            return (u.id_client && u.id_client === this.editingUserId) || u.id === this.editingUserId;
          });
          if (userIndex !== -1) {
            this.clients[userIndex] = { ...this.clients[userIndex], ...this.editingUser };
          }
        } else if (this.editingUserType === 'magasin') {
          const userIndex = this.providers.findIndex((u: ExtendedUser) => {
            return (u.id_magazin && u.id_magazin === this.editingUserId) || u.id === this.editingUserId;
          });
          if (userIndex !== -1) {
            this.providers[userIndex] = { ...this.providers[userIndex], ...this.editingUser };
          }
        } else if (this.editingUserType === 'livreur') {
          const userIndex = this.deliveryUsers.findIndex((u: ExtendedUser) => {
            return (u.id_liv && u.id_liv === this.editingUserId) || u.id === this.editingUserId;
          });
          if (userIndex !== -1) {
            this.deliveryUsers[userIndex] = { ...this.deliveryUsers[userIndex], ...this.editingUser };
          }
        }
        
        this.filterUsers();
        
        // Auto-close modal after 1.5 seconds to let user see success message
        setTimeout(() => {
          this.closeEditModal();
        }, 1500);
        
        // Hide success message after 4 seconds
        setTimeout(() => {
          this.showSuccessMessage = false;
        }, 4000);
      },
      error: (error) => {
        console.error('❌ Error saving user:', error);
        
        this.showErrorMessage = true;
        this.errorMessage = error.error?.message || 'Erreur lors de la mise à jour de l\'utilisateur';
        
        setTimeout(() => {
          this.showErrorMessage = false;
        }, 5000);
        
        this.saving = false;
      }
    });
  }

  changeUserRole(userId: number, newRole: 'admin' | 'client' | 'provider' | 'delivery') {
    // Only allow role changes for clients (since providers and delivery users are in separate tables)
    const user = this.clients.find((u: ExtendedUser) => u.id === userId);
    if (!user) {
      alert('Utilisateur introuvable');
      return;
    }
    
    if (!this.isRoleChangeAllowed(user.role, newRole)) {
      alert('Ce changement de rôle n\'est pas autorisé.');
      this.resetRoleSelect(userId, user.role);
      return;
    }
    
    const oldRole = user.role;
    console.log(`🔄 Changing user ${userId} role from ${oldRole} to ${newRole}`);
    
    user.role = newRole;
    this.filterUsers();
    
    alert(`Rôle de l'utilisateur changé de ${oldRole} à ${newRole}`);
  }

  isRoleChangeAllowed(currentRole: string, newRole: string): boolean {
    const allowedChanges = ['client', 'admin'];
    return allowedChanges.includes(currentRole) && allowedChanges.includes(newRole);
  }

  resetRoleSelect(userId: number, originalRole: string) {
    setTimeout(() => {
      const selectElement = document.querySelector(`select[data-user-id="${userId}"]`) as HTMLSelectElement;
      if (selectElement) {
        selectElement.value = originalRole;
      }
    }, 0);
  }

  onRoleChange(userId: number, event: Event) {
    const target = event.target as HTMLSelectElement;
    const newRole = target.value as 'admin' | 'client' | 'provider' | 'delivery';
    
    console.log(`🔄 Role change requested for user ${userId} to ${newRole}`);
    
    if (!newRole) {
      console.log('❌ No role selected');
      return;
    }
    
    this.changeUserRole(userId, newRole);
  }

  canChangeRole(user: any): boolean {
    return this.isRoleChangeAllowed(user.role, 'admin') || this.isRoleChangeAllowed(user.role, 'client');
  }

  getRoleClass(role: string): string {
    switch (role) {
      case 'admin': return 'role-admin';
      case 'client': return 'role-client';
      case 'provider': return 'role-provider';
      case 'delivery': return 'role-delivery';
      default: return '';
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

  formatDate(date: Date | string | undefined): string {
    if (!date) return 'N/A';
    
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return 'N/A';
    
    return d.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  toggleUserStatus(userId: number, tableType: string) {
    let user: ExtendedUser | undefined;
    
    switch (tableType) {
      case 'client':
        user = this.clients.find((u: ExtendedUser) => u.id === userId);
        break;
      case 'magasin':
        user = this.providers.find((u: ExtendedUser) => u.id === userId);
        break;
      case 'livreur':
        user = this.deliveryUsers.find((u: ExtendedUser) => u.id === userId);
        break;
    }
    if (user) {
      user.status = user.status === 'active' ? 'suspended' : 'active';
      this.filterUsers();
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

  getUserTypeText(role: string): string {
    switch (role) {
      case 'client': return 'l\'utilisateur';
      case 'admin': return 'l\'administrateur';
      case 'provider': return 'le fournisseur';
      case 'delivery': return 'le livreur';
      default: return 'l\'utilisateur';
    }
  }
}
