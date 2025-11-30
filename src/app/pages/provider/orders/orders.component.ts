import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Order {
  id: string;
  customer: string;
  items: string;
  total: number;
  status: string;
  date: Date;
  address: string;
  phone: string;
  paymentMethod: string;
}

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule, FormsModule],
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css']
})
export class OrdersComponent {
  orders: Order[] = [
    {
      id: '#ORD001',
      customer: 'Ahmed Ben Ali',
      items: 'Pizza Margherita x2, Coca Cola x3',
      total: 45.50,
      status: 'pending',
      date: new Date('2024-11-30T10:30:00'),
      address: '123 Rue de la République, Tunis',
      phone: '+216 20 123 456',
      paymentMethod: 'card'
    },
    {
      id: '#ORD002',
      customer: 'Fatma Trabelsi',
      items: 'Samsung Galaxy S24, Protective Case',
      total: 1299.00,
      status: 'confirmed',
      date: new Date('2024-11-30T09:15:00'),
      address: '456 Avenue Habib Bourguiba, Sfax',
      phone: '+216 25 987 654',
      paymentMethod: 'cash'
    },
    {
      id: '#ORD003',
      customer: 'Mohamed Gharbi',
      items: 'Paracetamol x2, Vitamin C x1',
      total: 15.80,
      status: 'delivered',
      date: new Date('2024-11-29T16:45:00'),
      address: '789 Rue Mongi Slim, Sousse',
      phone: '+216 22 456 789',
      paymentMethod: 'card'
    },
    {
      id: '#ORD004',
      customer: 'Leila Mansouri',
      items: 'Fresh Vegetables, Organic Fruits',
      total: 28.75,
      status: 'preparing',
      date: new Date('2024-11-30T14:20:00'),
      address: '321 Boulevard du 7 Novembre, Monastir',
      phone: '+216 29 654 321',
      paymentMethod: 'cash'
    },
    {
      id: '#ORD005',
      customer: 'Karim Bouaziz',
      items: 'Laptop Dell, Wireless Mouse',
      total: 1850.00,
      status: 'cancelled',
      date: new Date('2024-11-29T11:30:00'),
      address: '654 Rue Ibn Khaldoun, Bizerte',
      phone: '+216 24 789 123',
      paymentMethod: 'card'
    }
  ];

  filteredOrders = [...this.orders];
  searchTerm = '';
  selectedStatus = '';
  selectedPayment = '';

  statuses = ['pending', 'confirmed', 'preparing', 'delivered', 'cancelled'];
  paymentMethods = ['card', 'cash'];

  filterOrders() {
    this.filteredOrders = this.orders.filter(order => {
      const matchesSearch = order.customer.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                           order.id.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                           order.items.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesStatus = !this.selectedStatus || order.status === this.selectedStatus;
      const matchesPayment = !this.selectedPayment || order.paymentMethod === this.selectedPayment;
      
      return matchesSearch && matchesStatus && matchesPayment;
    });
  }

  updateStatus(orderId: string, newStatus: string) {
    const order = this.orders.find(o => o.id === orderId);
    if (order) {
      order.status = newStatus;
      this.filterOrders();
    }
  }

  viewOrder(orderId: string) {
    console.log('View order details:', orderId);
  }

  printOrder(orderId: string) {
    console.log('Print order:', orderId);
  }

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'pending': '#f59e0b',
      'confirmed': '#3b82f6',
      'preparing': '#8b5cf6',
      'delivered': '#10b981',
      'cancelled': '#ef4444'
    };
    return colors[status] || '#6b7280';
  }

  get totalOrderValue(): number {
    return this.filteredOrders.reduce((sum, order) => sum + order.total, 0);
  }
}