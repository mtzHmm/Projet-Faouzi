import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { SigninComponent } from './pages/signin/signin.component';
import { SignupComponent } from './pages/signup/signup.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'signin', component: SigninComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'cart', loadChildren: () => import('./pages/cart/cart.routes').then(m => m.routes) },
  { path: 'delivery', loadChildren: () => import('./pages/delivery/delivery.routes').then(m => m.routes) },
  { path: 'shop', loadChildren: () => import('./pages/shop/shop.routes').then(m => m.routes) },
  { path: 'contact', loadChildren: () => import('./pages/contact/contact.routes').then(m => m.routes) },
  { 
    path: 'restaurant', 
    loadChildren: () => import('./pages/restaurant/restaurant.routes').then(m => m.routes)
  },
  { 
    path: 'boutique', 
    loadChildren: () => import('./pages/boutique/boutique.routes').then(m => m.routes)
  },
  { 
    path: 'pharmacie', 
    loadChildren: () => import('./pages/pharmacie/pharmacie.routes').then(m => m.routes)
  },
  { 
    path: 'courses', 
    loadChildren: () => import('./pages/courses/courses.routes').then(m => m.routes)
  },
  { 
    path: 'admin', 
    loadChildren: () => import('./pages/admin/admin.routes').then(m => m.routes)
  },
  { 
    path: 'provider', 
    loadChildren: () => import('./pages/provider/provider.routes').then(m => m.routes)
  },
  { 
    path: 'user-management', 
    loadComponent: () => import('./pages/user-management/user-management.component').then(m => m.UserManagementComponent)
  },
  // Legacy redirects
  { path: 'pharmacy', redirectTo: '/pharmacie' },
  { path: 'grocery', redirectTo: '/courses' },
  { path: '**', redirectTo: '' }
];
