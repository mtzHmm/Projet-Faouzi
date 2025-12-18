import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { OrderService, Order as DbOrder } from '../../services/order.service';
import { DeliveryService } from '../../services/delivery.service';

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  total: number;
}

interface Order {
  id: string;
  storeName: string;
  storeAddress: string;
  customer: {
    firstName: string;
    lastName: string;
    fullName: string;
  };
  phone: string;
  address: string;
  items: OrderItem[];
  itemsText: string;
  status: 'en_attente' | 'en_préparation' | 'préparée' | 'annulée' | 'en_livraison' | 'livrée';
  amount: number;
  createdAt: Date;
}

@Component({
  selector: 'app-delivery',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './delivery.component.html',
  styleUrls: ['./delivery.component.css']
})
export class DeliveryComponent implements OnInit {
  deliveryName = 'Ahmed Ben Ali';
  totalEarnings = 1250.50;
  completedDeliveries = 24;
  rating = 4.8;

  selectedTab: 'pending' | 'accepted' | 'delivered' = 'pending';
  selectedOrder: Order | null = null;
  showModal = false;

  // Orders array will be populated from database
  orders: Order[] = [];

  constructor(
    private authService: AuthService,
    private orderService: OrderService,
    private deliveryService: DeliveryService
  ) {}

  ngOnInit() {
    this.loadUserData();
    this.loadAllOrders();
  }

  loadAllOrders() {
    // Clear orders first
    this.orders = [];
    
    // Load both pending and in-progress orders
    this.loadPreparedOrders();
    this.loadMyDeliveries();
  }

  loadUserData() {
    const userData = this.authService.getUserData();
    if (userData) {
      this.deliveryName = this.authService.getFullUserName() || 'Delivery Partner';
    }
  }

  loadPreparedOrders() {
    // Fetch ONLY orders with status "préparée" from database for pending orders
    this.orderService.getOrders({ status: 'préparée' }).subscribe({
      next: (response) => {
        console.log('📦 Loaded prepared orders from database:', response.orders);
        
        // Convert database orders to component format
        const preparedOrders: Order[] = response.orders.map(dbOrder => ({
          id: dbOrder.id.toString(),
          storeName: 'Store',
          storeAddress: '',
          customer: {
            firstName: dbOrder.userName.split(' ')[0] || '',
            lastName: dbOrder.userName.split(' ')[1] || '',
            fullName: dbOrder.userName
          },
          phone: dbOrder.userPhone,
          address: `${dbOrder.deliveryAddress}, ${dbOrder.city}`,
          items: dbOrder.items.map(item => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            total: item.total || (item.quantity * item.price)
          })),
          itemsText: dbOrder.items.map(item => `${item.name} x${item.quantity}`).join(', '),
          status: 'préparée',
          amount: dbOrder.total,
          createdAt: new Date(dbOrder.createdAt)
        }));

        // Add prepared orders to the orders array
        this.orders = [...this.orders.filter(o => o.status !== 'préparée'), ...preparedOrders];
        
        console.log(`✅ Loaded ${preparedOrders.length} prepared orders for delivery`);
      },
      error: (error) => {
        console.error('❌ Error loading prepared orders:', error);
      }
    });
  }

  loadMyDeliveries() {
    const deliveryId = this.authService.getDeliveryId();
    
    if (!deliveryId) {
      console.log('⚠️ No delivery ID found, skipping livraisons load');
      return;
    }
    
    console.log(`🚚 Loading livraisons for delivery person ${deliveryId}`);
    
    this.deliveryService.getMyDeliveries(deliveryId).subscribe({
      next: (response) => {
        console.log('📦 Loaded my deliveries from database:', response.deliveries);
        
        // Convert livraison data to component format
        const inProgressOrders: Order[] = response.deliveries.map((delivery: any) => ({
          id: delivery.id_cmd.toString(),
          storeName: 'Store',
          storeAddress: '',
          customer: {
            firstName: delivery.user_name?.split(' ')[0] || '',
            lastName: delivery.user_name?.split(' ')[1] || '',
            fullName: delivery.user_name || ''
          },
          phone: delivery.user_phone || '',
          address: `${delivery.delivery_address || ''}, ${delivery.city || ''}`,
          items: delivery.items.map((item: any) => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            total: item.quantity * item.price
          })),
          itemsText: delivery.items.map((item: any) => `${item.name} x${item.quantity}`).join(', '),
          status: 'en_livraison',
          amount: delivery.total || 0,
          createdAt: new Date(delivery.date_commande)
        }));

        // Add in-progress orders to the orders array (remove old in-progress first to avoid duplicates)
        this.orders = [...this.orders.filter(o => o.status !== 'en_livraison'), ...inProgressOrders];
        
        console.log(`✅ Loaded ${inProgressOrders.length} in-progress deliveries`);
      },
      error: (error) => {
        console.error('❌ Error loading my deliveries:', error);
      }
    });
  }

  get pendingOrders(): Order[] {
    return this.orders.filter(o => o.status === 'préparée');
  }

  get acceptedOrders(): Order[] {
    return this.orders.filter(o => o.status === 'en_préparation' || o.status === 'en_livraison');
  }

  get deliveredOrders(): Order[] {
    return this.orders.filter(o => o.status === 'livrée');
  }

  acceptOrder(orderId: string) {
    const deliveryId = this.authService.getDeliveryId();
    
    if (!deliveryId) {
      console.error('❌ No delivery ID found for current user');
      alert('Unable to identify delivery person. Please check your login.');
      return;
    }
    
    console.log(`📦 Accepting order ${orderId} as delivery person ${deliveryId}`);
    
    this.deliveryService.acceptOrder(Number(orderId), deliveryId).subscribe({
      next: (response) => {
        console.log('✅ Order accepted and livraison created:', response);
        
        // Reload all orders to refresh both pending and in-progress
        this.loadAllOrders();
        
        alert('Order accepted successfully! Livraison created.');
      },
      error: (error) => {
        console.error('❌ Error accepting order:', error);
        alert('Failed to accept order: ' + (error.error?.message || 'Unknown error'));
      }
    });
  }

  pickupOrder(orderId: string) {
    const order = this.orders.find(o => o.id === orderId);
    if (order) {
      order.status = 'en_livraison';
    }
  }

  completeDelivery(orderId: string) {
    const order = this.orders.find(o => o.id === orderId);
    if (order) {
      order.status = 'livrée';
      this.completedDeliveries++;
      this.totalEarnings += order.amount * 0.15;
    }
  }

  rejectOrder(orderId: string) {
    this.orders = this.orders.filter(o => o.id !== orderId);
  }

  getStatusBadgeClass(status: string): string {
    switch(status) {
      case 'en_attente': return 'badge-pending';
      case 'en_préparation': return 'badge-accepted';
      case 'préparée': return 'badge-ready';
      case 'en_livraison': return 'badge-picked';
      case 'livrée': return 'badge-delivered';
      case 'annulée': return 'badge-cancelled';
      default: return '';
    }
  }

  getStatusLabel(status: string): string {
    switch(status) {
      case 'en_attente': return 'En Attente';
      case 'en_préparation': return 'En Préparation';
      case 'préparée': return 'Préparée';
      case 'en_livraison': return 'En Livraison';
      case 'livrée': return 'Livrée';
      case 'annulée': return 'Annulée';
      default: return status;
    }
  }

  selectOrder(order: Order) {
    this.selectedOrder = order;
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.selectedOrder = null;
  }
}
