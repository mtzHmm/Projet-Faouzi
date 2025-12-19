import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { OrderService } from '../../../services/order.service';
import { ProductService } from '../../../services/product.service';
import { forkJoin } from 'rxjs';

interface ReportData {
  period: string;
  sales: number;
  orders: number;
  revenue: number;
  profit: number;
}

interface TopProduct {
  name: string;
  category: string;
  sales: number;
  revenue: number;
}

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule, FormsModule],
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class ReportsComponent implements OnInit {
  selectedPeriod = 'month';
  selectedReport = 'sales';
  providerId: number | null = null;
  loading = true;

  periods = [
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'This Quarter' },
    { value: 'year', label: 'This Year' }
  ];

  reportTypes = [
    { value: 'sales', label: 'Sales Report' },
    { value: 'financial', label: 'Financial Report' },
    { value: 'customer', label: 'Customer Report' }
  ];

  salesData: ReportData[] = [];
  topProducts: TopProduct[] = [];

  metrics = {
    totalRevenue: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    growthRate: 0,
    customerSatisfaction: 4.5,
    returnRate: 0
  };

  constructor(
    private authService: AuthService,
    private orderService: OrderService,
    private productService: ProductService
  ) {}

  ngOnInit() {
    this.providerId = this.authService.getProviderId();
    console.log('👤 Provider ID:', this.providerId);
    
    if (this.providerId) {
      this.loadReportData();
    }
  }

  loadReportData() {
    if (!this.providerId) return;

    forkJoin({
      stats: this.orderService.getOrderStats(this.providerId),
      products: this.productService.getProducts({ store_id: this.providerId }),
      orders: this.orderService.getOrders({ providerId: this.providerId, limit: 100 })
    }).subscribe({
      next: (data) => {
        console.log('📊 Report data loaded:', data);
        
        // Update metrics
        this.metrics.totalRevenue = data.stats.totalRevenue || 0;
        this.metrics.totalOrders = data.stats.totalOrders || 0;
        this.metrics.averageOrderValue = data.stats.averageOrderValue || 0;
        
        // Calculate growth rate (simplified - comparing to a baseline)
        if (this.metrics.totalOrders > 0) {
          this.metrics.growthRate = ((this.metrics.totalOrders - 10) / 10) * 100;
        }

        // Process orders for weekly sales data
        this.processWeeklySales(data.orders.orders);

        // Process products for top performers
        this.processTopProducts(data.products.products, data.orders.orders);

        this.loading = false;
      },
      error: (error) => {
        console.error('❌ Error loading report data:', error);
        this.loading = false;
      }
    });
  }

  processWeeklySales(orders: any[]) {
    const weeklyData: { [key: string]: { orders: number; revenue: number } } = {};
    const today = new Date();
    
    // Initialize last 4 weeks
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - (i * 7));
      const weekKey = `Week ${4 - i}`;
      weeklyData[weekKey] = { orders: 0, revenue: 0 };
    }

    // Process orders
    orders.forEach(order => {
      const orderDate = new Date(order.createdAt);
      const weeksAgo = Math.floor((today.getTime() - orderDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
      
      if (weeksAgo >= 0 && weeksAgo < 4) {
        const weekKey = `Week ${4 - weeksAgo}`;
        if (weeklyData[weekKey]) {
          weeklyData[weekKey].orders++;
          weeklyData[weekKey].revenue += order.total || 0;
        }
      }
    });

    this.salesData = Object.keys(weeklyData).map(period => ({
      period,
      orders: weeklyData[period].orders,
      revenue: weeklyData[period].revenue,
      sales: weeklyData[period].orders,
      profit: weeklyData[period].revenue * 0.25 // Assuming 25% profit margin
    }));

    console.log('📈 Weekly sales data:', this.salesData);
  }

  processTopProducts(products: any[], orders: any[]) {
    const productSales: { [key: number]: { name: string; category: string; quantity: number; revenue: number } } = {};

    // Process all orders to calculate product sales
    orders.forEach(order => {
      order.items?.forEach((item: any) => {
        if (!productSales[item.id]) {
          productSales[item.id] = {
            name: item.name,
            category: 'Product',
            quantity: 0,
            revenue: 0
          };
        }
        productSales[item.id].quantity += item.quantity || 0;
        productSales[item.id].revenue += (item.price || 0) * (item.quantity || 0);
      });
    });

    // Convert to array and sort by revenue
    this.topProducts = Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10)
      .map(p => ({
        name: p.name,
        category: p.category,
        sales: p.quantity,
        revenue: p.revenue
      }));

    console.log('🏆 Top products:', this.topProducts);
  }

  generateReport() {
    console.log(`Generating ${this.selectedReport} report for ${this.selectedPeriod}`);
    this.loadReportData();
  }

  exportReport(format: string) {
    console.log(`Exporting report as ${format}`);
    alert(`Export to ${format.toUpperCase()} feature coming soon!`);
  }

  getTrendIcon(value: number): string {
    return value > 0 ? '📈' : value < 0 ? '📉' : '➡️';
  }

  getTrendClass(value: number): string {
    return value > 0 ? 'positive' : value < 0 ? 'negative' : 'neutral';
  }

  getPerformanceWidth(revenue: number): number {
    if (this.topProducts.length === 0) return 0;
    const maxRevenue = Math.max(...this.topProducts.map(p => p.revenue));
    return maxRevenue > 0 ? (revenue / maxRevenue) * 100 : 0;
  }
}