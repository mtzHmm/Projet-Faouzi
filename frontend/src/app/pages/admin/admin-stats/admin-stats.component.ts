import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminService } from '../../../services/admin.service';

interface CategoryStats {
  restaurant: number;
  boutique: number;
  pharmacie: number;
}

interface MonthlyData {
  month: string;
  revenue: number;
  orders: number;
}

@Component({
  selector: 'app-admin-stats',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-stats.component.html',
  styleUrl: './admin-stats.component.css'
})
export class AdminStatsComponent implements OnInit {
  isLoading = true;
  
  // Overview Stats
  totalRevenue = 0;
  totalOrders = 0;
  averageOrderValue = 0;
  
  // Category Sales
  categoryStats: CategoryStats = {
    restaurant: 0,
    boutique: 0,
    pharmacie: 0
  };
  
  // Monthly Data
  monthlyData: MonthlyData[] = [];
  
  // Top performers
  topProducts: any[] = [];
  topProviders: any[] = [];

  constructor(
    private adminService: AdminService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadStats();
  }

  loadStats() {
    this.isLoading = true;
    console.log('📊 Loading stats...');
    
    // Load dashboard stats
    this.adminService.getDashboardStats().subscribe({
      next: (data) => {
        console.log('✅ Stats data received:', data);
        this.totalRevenue = data.totalRevenue || 0;
        this.totalOrders = data.totalOrders || 0;
        this.averageOrderValue = this.totalOrders > 0 ? this.totalRevenue / this.totalOrders : 0;
        
        // Mock category stats for now (you can add this to backend later)
        this.categoryStats = {
          restaurant: Math.round(this.totalRevenue * 0.4),
          boutique: Math.round(this.totalRevenue * 0.35),
          pharmacie: Math.round(this.totalRevenue * 0.25)
        };
        
        // Use real monthly data from backend or generate if not available
        if (data.monthlyData && data.monthlyData.length > 0) {
          this.monthlyData = data.monthlyData;
          console.log('📅 Using real monthly data:', this.monthlyData);
        } else {
          this.generateMonthlyData();
          console.log('📅 Generated mock monthly data');
        }
        
        console.log('📈 Stats loaded:', {
          totalRevenue: this.totalRevenue,
          totalOrders: this.totalOrders,
          averageOrderValue: this.averageOrderValue,
          monthlyDataCount: this.monthlyData.length
        });
        
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        console.error('❌ Error loading stats:', error);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  generateMonthlyData() {
    const months = ['Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
    const baseRevenue = this.totalRevenue / 6;
    
    this.monthlyData = months.map((month, index) => ({
      month,
      revenue: Math.round(baseRevenue * (0.8 + Math.random() * 0.4)),
      orders: Math.round((this.totalOrders / 6) * (0.8 + Math.random() * 0.4))
    }));
  }

  getCategoryPercentage(category: keyof CategoryStats): number {
    if (this.totalRevenue === 0) return 0;
    return Math.round((this.categoryStats[category] / this.totalRevenue) * 100);
  }

  getGrowthTrend(): string {
    if (this.monthlyData.length < 2) return '0';
    const lastMonth = this.monthlyData[this.monthlyData.length - 1].revenue;
    const prevMonth = this.monthlyData[this.monthlyData.length - 2].revenue;
    const growth = ((lastMonth - prevMonth) / prevMonth) * 100;
    return growth > 0 ? `+${growth.toFixed(1)}` : growth.toFixed(1);
  }
}
