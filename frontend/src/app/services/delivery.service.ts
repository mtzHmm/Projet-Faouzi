import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export type DeliveryStatus =
  | 'en_attente'
  | 'en_préparation'
  | 'préparée'
  | 'annulée'
  | 'en_livraison'
  | 'livrée';

export interface Delivery {
  id: number;
  orderId: number;
  livreurId: number;
  livreurName?: string;
  status: DeliveryStatus;
  pickupAddress?: string;
  deliveryAddress?: string;
  estimatedTime?: Date;
  actualTime?: Date;
  createdAt: Date;
  updatedAt?: Date;
}

export interface DeliveriesResponse {
  deliveries: Delivery[];
  total: number;
  page: number;
  totalPages: number;
}

export interface CreateDeliveryRequest {
  orderId: number;
  livreurId: number;
  pickupAddress?: string;
  deliveryAddress?: string;
  estimatedTime?: Date;
}

export interface DeliveryStats {
  totalDeliveries: number;
  pendingDeliveries: number;
  inProgressDeliveries: number;
  completedDeliveries: number;
  cancelledDeliveries: number;
}

@Injectable({
  providedIn: 'root'
})
export class DeliveryService {
  private apiUrl = `${environment.apiUrl}/deliveries`;

  constructor(private http: HttpClient) {}

  getDeliveries(filters?: {
    status?: DeliveryStatus;
    livreurId?: number;
    orderId?: number;
    page?: number;
    limit?: number;
  }): Observable<DeliveriesResponse> {
    let params = new HttpParams();
    
    if (filters?.status) params = params.set('status', filters.status);
    if (filters?.livreurId) params = params.set('livreurId', filters.livreurId.toString());
    if (filters?.orderId) params = params.set('orderId', filters.orderId.toString());
    if (filters?.page) params = params.set('page', filters.page.toString());
    if (filters?.limit) params = params.set('limit', filters.limit.toString());

    return this.http.get<DeliveriesResponse>(this.apiUrl, { params });
  }

  getDeliveryById(id: number): Observable<Delivery> {
    return this.http.get<Delivery>(`${this.apiUrl}/${id}`);
  }

  createDelivery(delivery: CreateDeliveryRequest): Observable<Delivery> {
    return this.http.post<Delivery>(this.apiUrl, delivery);
  }

  updateDeliveryStatus(id: number, status: DeliveryStatus): Observable<Delivery> {
    return this.http.put<Delivery>(`${this.apiUrl}/${id}/status`, { status });
  }

  assignDelivery(id: number, livreurId: number): Observable<Delivery> {
    return this.http.put<Delivery>(`${this.apiUrl}/${id}/assign`, { livreurId });
  }

  getDeliveryStats(livreurId?: number): Observable<DeliveryStats> {
    let params = new HttpParams();
    if (livreurId) params = params.set('livreurId', livreurId.toString());
    
    return this.http.get<DeliveryStats>(`${this.apiUrl}/stats/summary`, { params });
  }

  getDeliveriesByLivreur(livreurId: number, filters?: {
    status?: DeliveryStatus;
    page?: number;
    limit?: number;
  }): Observable<DeliveriesResponse> {
    return this.getDeliveries({ ...filters, livreurId });
  }

  getDeliveriesByOrder(orderId: number): Observable<DeliveriesResponse> {
    return this.getDeliveries({ orderId });
  }

  acceptOrder(orderId: number, deliveryId: number): Observable<any> {
    return this.http.post(`${environment.apiUrl}/delivery/accept-order`, {
      orderId,
      deliveryId
    });
  }

  getMyDeliveries(deliveryId: number): Observable<any> {
    return this.http.get(`${environment.apiUrl}/delivery/my-deliveries/${deliveryId}`);
  }

  completeDelivery(orderId: number): Observable<any> {
    return this.http.put(`${environment.apiUrl}/delivery/complete-delivery/${orderId}`, {});
  }
}
