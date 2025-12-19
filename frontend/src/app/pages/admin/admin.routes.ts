import { Routes } from '@angular/router';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { AdminOrdersComponent } from './admin-orders/admin-orders.component';
import { AdminStatsComponent } from './admin-stats/admin-stats.component';

export const routes: Routes = [
  { path: '', component: AdminDashboardComponent },
  { path: 'orders', component: AdminOrdersComponent },
  { path: 'stats', component: AdminStatsComponent },
  { path: 'dashboard', redirectTo: '', pathMatch: 'full' }
];