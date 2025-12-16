import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface Customer {
  id: number;
  fullName: string;
  phone: string;
  email: string;
}

interface Store {
  id: number;
  name: string;
  type: string;
  address: string;
}

interface Order {
  id: string;
  customer: Customer;
  storeName: string;
  storeType: string;
  storeAddress: string;
  phone: string;
  address: string;
  amount: number;
  status: 'pending' | 'accepted' | 'completed' | 'cancelled';
  itemsText: string;
  createdAt: Date;
  acceptedAt?: Date;
  completedAt?: Date;
}

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, FormsModule],
  templateUrl: './admin-orders.component.html',
  styleUrl: './admin-orders.component.css'
})
export class AdminOrdersComponent implements OnInit {
  orders: Order[] = [];
  filteredOrders: Order[] = [];
  selectedStatus: string = '';
  searchTerm: string = '';
  selectedOrder: Order | null = null;
  showOrderDetails: boolean = false;

  // Mock users data
  mockUsers: Customer[] = [
    { id: 1, fullName: 'hamam Mootaz', phone: '+216 98 765 432', email: 'hamam.mootaz@email.com' },
    { id: 2, fullName: 'jaafeer seif', phone: '+216 22 334 455', email: 'jaafeer.seif@email.com' },
    { id: 3, fullName: 'Omar Khelifi', phone: '+216 55 667 788', email: 'omar.khelifi@email.com' },
    { id: 4, fullName: 'Sarra Mansouri', phone: '+216 77 889 900', email: 'sarra.mansouri@email.com' },
    { id: 5, fullName: 'Ahmed Ben Ali', phone: '+216 20 111 222', email: 'ahmed.benali@email.com' }
  ];

  // Mock stores data  
  mockStores: Store[] = [
    { id: 1, name: 'Bella Pizza', type: 'Restaurant', address: '123 Avenue Habib Bourguiba, Tunis' },
    { id: 2, name: 'Pharmacie Ibn Sina', type: 'Pharmacie', address: '456 Rue de la Liberté, Sfax' },
    { id: 3, name: 'Urban Fashion', type: 'Boutique', address: '789 Avenue Mohamed V, Sousse' },
    { id: 4, name: 'TechStore', type: 'Boutique', address: '321 Rue Mongi Slim, Ariana' },
    { id: 5, name: 'Café Central', type: 'Restaurant', address: '654 Place de l\'Indépendance, Bizerte' }
  ];

  statusOptions = [
    { value: '', label: 'Tous les statuts' },
    { value: 'pending', label: 'En attente' },
    { value: 'accepted', label: 'Acceptée' },
    { value: 'completed', label: 'Terminée' },
    { value: 'cancelled', label: 'Annulée' }
  ];

  ngOnInit() {
    this.loadMockOrders();
  }

  loadMockOrders() {
    // Generate mock orders
    const mockOrders: Order[] = [
      {
        id: 'ORD-001',
        customer: this.mockUsers[0], // hamam Mootaz
        storeName: this.mockStores[0].name, // Bella Pizza
        storeType: this.mockStores[0].type,
        storeAddress: this.mockStores[0].address,
        phone: this.mockUsers[0].phone,
        address: '15 Rue des Jasmins, La Marsa',
        amount: 32.500,
        status: 'pending',
        itemsText: '1x pizza neptune (25.000 DT), 1x Coca Cola (2.500 DT), 1x Salade César (5.000 DT)',
        createdAt: new Date(2024, 0, 15, 14, 30),
      },
      {
        id: 'ORD-002',
        customer: this.mockUsers[1], // jaafeer seif
        storeName: this.mockStores[1].name, // Pharmacie Ibn Sina
        storeType: this.mockStores[1].type,
        storeAddress: this.mockStores[1].address,
        phone: this.mockUsers[1].phone,
        address: '42 Avenue de la République, Tunis',
        amount: 45.750,
        status: 'accepted',
        itemsText: '2x Doliprane (12.000 DT), 1x Vitamines C (15.500 DT), 1x Sirop contre la toux (18.250 DT)',
        createdAt: new Date(2024, 0, 15, 10, 45),
        acceptedAt: new Date(2024, 0, 15, 11, 0),
      },
      {
        id: 'ORD-003',
        customer: this.mockUsers[2], // Omar Khelifi
        storeName: this.mockStores[2].name, // Urban Fashion
        storeType: this.mockStores[2].type,
        storeAddress: this.mockStores[2].address,
        phone: this.mockUsers[2].phone,
        address: '28 Cité El Khadra, Tunis',
        amount: 125.000,
        status: 'completed',
        itemsText: '1x Chemise Business (65.000 DT), 1x Pantalon Classique (45.000 DT), 1x Cravate (15.000 DT)',
        createdAt: new Date(2024, 0, 14, 16, 20),
        acceptedAt: new Date(2024, 0, 14, 16, 35),
        completedAt: new Date(2024, 0, 14, 18, 10),
      },
      {
        id: 'ORD-004',
        customer: this.mockUsers[3], // Sarra Mansouri
        storeName: this.mockStores[3].name, // TechStore
        storeType: this.mockStores[3].type,
        storeAddress: this.mockStores[3].address,
        phone: this.mockUsers[3].phone,
        address: '67 Rue Ibn Khaldoun, Manouba',
        amount: 899.000,
        status: 'completed',
        itemsText: '1x Smartphone Samsung Galaxy (650.000 DT), 1x Coque de protection (25.000 DT), 1x Chargeur sans fil (224.000 DT)',
        createdAt: new Date(2024, 0, 13, 9, 15),
        acceptedAt: new Date(2024, 0, 13, 9, 30),
        completedAt: new Date(2024, 0, 13, 15, 45),
      },
      {
        id: 'ORD-005',
        customer: this.mockUsers[4], // Ahmed Ben Ali
        storeName: this.mockStores[4].name, // Café Central
        storeType: this.mockStores[4].type,
        storeAddress: this.mockStores[4].address,
        phone: this.mockUsers[4].phone,
        address: '91 Impasse des Oliviers, Ben Arous',
        amount: 18.500,
        status: 'cancelled',
        itemsText: '2x Café Express (6.000 DT), 1x Croissant (4.500 DT), 1x Jus d\'orange frais (8.000 DT)',
        createdAt: new Date(2024, 0, 12, 8, 0),
      },
      {
        id: 'ORD-006',
        customer: this.mockUsers[0], // hamam Mootaz
        storeName: this.mockStores[1].name, // Pharmacie Ibn Sina
        storeType: this.mockStores[1].type,
        storeAddress: this.mockStores[1].address,
        phone: this.mockUsers[0].phone,
        address: '15 Rue des Jasmins, La Marsa',
        amount: 28.750,
        status: 'accepted',
        itemsText: '1x Aspirine (8.500 DT), 1x Pansements (5.250 DT), 1x Désinfectant (15.000 DT)',
        createdAt: new Date(2024, 0, 11, 12, 30),
        acceptedAt: new Date(2024, 0, 11, 12, 45),
      }
    ];

    this.orders = mockOrders;
    this.filterOrders();
  }

  filterOrders() {
    this.filteredOrders = this.orders.filter(order => {
      const matchesStatus = !this.selectedStatus || order.status === this.selectedStatus;
      const matchesSearch = !this.searchTerm || 
        order.customer.fullName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        order.id.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        order.storeName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        order.customer.email.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      return matchesStatus && matchesSearch;
    });
  }

  onStatusChange() {
    this.filterOrders();
  }

  onSearchChange() {
    this.filterOrders();
  }

  updateOrderStatus(orderId: string, newStatus: string) {
    const order = this.orders.find(o => o.id === orderId);
    if (order) {
      order.status = newStatus as any;
      
      // Update timestamps based on status
      if (newStatus === 'accepted' && !order.acceptedAt) {
        order.acceptedAt = new Date();
      } else if (newStatus === 'completed' && !order.completedAt) {
        order.completedAt = new Date();
        if (!order.acceptedAt) {
          order.acceptedAt = new Date(Date.now() - 30 * 60000); // 30 minutes before completion
        }
      }
      
      this.filterOrders();
      console.log('Order status updated:', order);
    }
  }

  updateOrderStatusFromEvent(orderId: string, event: Event) {
    const select = event.target as HTMLSelectElement | null;
    if (select) {
      this.updateOrderStatus(orderId, select.value);
    }
  }


  viewOrderDetails(order: Order) {
    this.selectedOrder = order;
    this.showOrderDetails = true;
  }

  closeOrderDetails() {
    this.showOrderDetails = false;
    this.selectedOrder = null;
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'accepted': return '#3b82f6';
      case 'completed': return '#10b981';
      case 'cancelled': return '#e74c3c';
      default: return '#95a5a6';
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'pending': return 'pending';
      case 'accepted': return 'accepted';
      case 'completed': return 'completed';
      case 'cancelled': return 'cancelled';
      default: return '';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'pending': return 'En attente';
      case 'accepted': return 'Acceptée';
      case 'completed': return 'Terminée';
      case 'cancelled': return 'Annulée';
      default: return status;
    }
  }
}