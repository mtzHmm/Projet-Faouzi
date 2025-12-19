import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface DashboardStats {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  activeDeliveries: number;
  pendingOrders: number;
  recentOrders: any[];
  recentUsers: any[];
  monthlyData?: Array<{ month: string; revenue: number; orders: number }>;
  salesByCategory: {
    restaurant: number;
    boutique: number;
    pharmacie: number;
  };
  monthlyRevenue: Array<{ month: string; revenue: number }>;
}

export interface ReportData {
  type: string;
  period: string;
  [key: string]: any;
}

export interface AnalyticsData {
  overview: {
    totalRevenue: number;
    growth: number;
    orderGrowth: number;
    userGrowth: number;
  };
  chartData: {
    daily: Array<{ date: string; orders: number; revenue: number }>;
    categories: {
      restaurant: number;
      boutique: number;
      pharmacie: number;
    };
    hourlyActivity: Array<{ hour: number; orders: number }>;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = `${environment.apiUrl}/admin`;

  constructor(private http: HttpClient) {}

  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.apiUrl}/dashboard`);
  }

  getReports(type: string, startDate?: string, endDate?: string): Observable<ReportData> {
    let params = new HttpParams().set('type', type);
    
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);

    return this.http.get<ReportData>(`${this.apiUrl}/reports`, { params });
  }

  getAnalytics(): Observable<AnalyticsData> {
    return this.http.get<AnalyticsData>(`${this.apiUrl}/analytics`);
  }

  updateSettings(settings: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/settings`, settings);
  }
}
