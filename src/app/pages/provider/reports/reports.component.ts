import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
export class ReportsComponent {
  selectedPeriod = 'month';
  selectedReport = 'sales';

  periods = [
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'This Quarter' },
    { value: 'year', label: 'This Year' }
  ];

  reportTypes = [
    { value: 'sales', label: 'Sales Report' },
    { value: 'inventory', label: 'Inventory Report' },
    { value: 'financial', label: 'Financial Report' },
    { value: 'customer', label: 'Customer Report' }
  ];

  salesData: ReportData[] = [
    { period: 'Week 1', sales: 45, orders: 23, revenue: 1250.50, profit: 312.75 },
    { period: 'Week 2', sales: 67, orders: 34, revenue: 1890.25, profit: 472.56 },
    { period: 'Week 3', sales: 52, orders: 28, revenue: 1456.80, profit: 364.20 },
    { period: 'Week 4', sales: 78, orders: 41, revenue: 2185.90, profit: 546.48 }
  ];

  topProducts: TopProduct[] = [
    { name: 'Pizza Margherita', category: 'Restaurant', sales: 156, revenue: 2886.00 },
    { name: 'Smartphone Samsung', category: 'Electronics', sales: 23, revenue: 20677.00 },
    { name: 'Fresh Apples', category: 'Grocery', sales: 89, revenue: 311.50 },
    { name: 'Paracetamol 500mg', category: 'Pharmacy', sales: 234, revenue: 1216.80 }
  ];

  metrics = {
    totalRevenue: 15840.75,
    totalOrders: 324,
    averageOrderValue: 48.89,
    growthRate: 12.5,
    customerSatisfaction: 4.7,
    returnRate: 3.2
  };

  generateReport() {
    console.log(`Generating ${this.selectedReport} report for ${this.selectedPeriod}`);
  }

  exportReport(format: string) {
    console.log(`Exporting report as ${format}`);
  }

  getTrendIcon(value: number): string {
    return value > 0 ? '📈' : value < 0 ? '📉' : '➡️';
  }

  getTrendClass(value: number): string {
    return value > 0 ? 'positive' : value < 0 ? 'negative' : 'neutral';
  }
}