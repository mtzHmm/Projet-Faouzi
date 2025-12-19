import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface OrderItem {
  id: number;
  name: string;
  quantity: number;
  price: number;
  total?: number; // Optional - calculated in backend
}
export type OrderStatus =
  | 'en attente'
  | 'en cours'
  | 'préparée'
  | 'livraison'
  | 'livrée'
  | 'annulée'
;
export interface Order {
  id: number;
  userId: number;
  userName: string;
  userEmail: string;
  userPhone: string;
  deliveryAddress: string;
  city: string;
  governorate: string;
  postalCode: string;
  additionalNotes: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  deliveryFee: number;
  total: number;
  status: OrderStatus;
  dateCommande: string;
  createdAt: Date;
}

export interface OrdersResponse {
  orders: Order[];
  total: number;
  page: number;
  totalPages: number;
}

export interface CreateOrderRequest {
  userId: number;
  userName: string;
  userEmail: string;
  userPhone: string;
  deliveryAddress: string;
  city: string;
  governorate: string;
  postalCode: string;
  additionalNotes: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  deliveryFee: number;
  total: number;
  dateCommande: string;
  status: string;
}

export interface OrderStats {
  totalOrders: number;
  waitingOrders?: number;
  preparedOrders?: number;
  inDeliveryOrders?: number;
  completedOrders: number;
  cancelledOrders?: number;
  pendingOrders?: number;
  totalRevenue: number;
  averageOrderValue: number;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = `${environment.apiUrl}/orders`;

  constructor(private http: HttpClient) {}

  getOrders(filters?: {
    status?: string;
    userId?: number;
    providerId?: number;
    page?: number;
    limit?: number;
  }): Observable<OrdersResponse> {
    let params = new HttpParams();
    
    if (filters?.status) params = params.set('status', filters.status);
    if (filters?.userId) params = params.set('userId', filters.userId.toString());
    if (filters?.providerId) params = params.set('providerId', filters.providerId.toString());
    if (filters?.page) params = params.set('page', filters.page.toString());
    if (filters?.limit) params = params.set('limit', filters.limit.toString());

    return this.http.get<OrdersResponse>(this.apiUrl, { params });
  }

  getOrderById(id: number): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/${id}`);
  }

  createOrder(order: CreateOrderRequest): Observable<Order> {
    return this.http.post<Order>(this.apiUrl, order);
  }

  updateOrderStatus(id: number, status: string): Observable<Order> {
    return this.http.put<Order>(`${this.apiUrl}/${id}/status`, { status });
  }

  getOrderStats(providerId?: number): Observable<OrderStats> {
    let params = new HttpParams();
    if (providerId) {
      params = params.set('providerId', providerId.toString());
    }
    return this.http.get<OrderStats>(`${this.apiUrl}/stats/summary`, { params });
  }
}
