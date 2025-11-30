import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./provider-dashboard/provider-dashboard.component').then(m => m.ProviderDashboardComponent)
  }
];