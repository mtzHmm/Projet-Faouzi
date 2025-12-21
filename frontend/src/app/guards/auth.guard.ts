import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  if (!authService.isLoggedIn()) {
    console.log('❌ Admin route access denied - not logged in');
    router.navigate(['/signin']);
    return false;
  }
  
  if (!authService.isAdmin()) {
    console.log('❌ Admin route access denied - insufficient privileges');
    router.navigate(['/']);
    return false;
  }
  
  console.log('✅ Admin route access granted');
  return true;
};

export const providerGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  if (!authService.isLoggedIn()) {
    console.log('❌ Provider route access denied - not logged in');
    router.navigate(['/signin']);
    return false;
  }
  
  if (!authService.isProvider()) {
    console.log('❌ Provider route access denied - insufficient privileges');
    router.navigate(['/']);
    return false;
  }
  
  console.log('✅ Provider route access granted');
  return true;
};

export const deliveryGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  if (!authService.isLoggedIn()) {
    console.log('❌ Delivery route access denied - not logged in');
    router.navigate(['/signin']);
    return false;
  }
  
  if (!authService.isDelivery()) {
    console.log('❌ Delivery route access denied - insufficient privileges');
    router.navigate(['/']);
    return false;
  }
  
  console.log('✅ Delivery route access granted');
  return true;
};

export const clientGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  if (!authService.isLoggedIn()) {
    console.log('❌ Client route access denied - not logged in');
    router.navigate(['/signin']);
    return false;
  }
  
  const userRole = authService.getUserRole().toLowerCase();
  if (userRole !== 'client' && userRole !== 'admin') {
    console.log('❌ Client route access denied - must be a client or admin');
    router.navigate(['/']);
    return false;
  }
  
  console.log('✅ Client route access granted');
  return true;
};