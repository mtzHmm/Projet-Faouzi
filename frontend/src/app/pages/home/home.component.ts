import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

interface ServiceCategory {
  icon: string;
  title: string;
  description: string;
  link: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  slogan = "Fast Delivery To Your Door.";
  isClient = false;
  canAccessOrders = false;
  clientName = '';
  
  constructor(private authService: AuthService) {}
  
  ngOnInit() {
    this.checkIfClient();
  }
  
  checkIfClient() {
    if (this.authService.isLoggedIn()) {
      const userRole = this.authService.getUserRole().toLowerCase();
      this.isClient = userRole === 'client';
      const isAdmin = userRole === 'admin';
      this.canAccessOrders = this.isClient || isAdmin;
      if (this.canAccessOrders) {
        this.clientName = this.authService.getUserName();
      }
    }
  }
  
  serviceCategories: ServiceCategory[] = [
    {
      icon: '🍽️',
      title: 'Restaurant',
      description: 'Order from your favorite restaurants',
      link: '/restaurant'
    },
    {
      icon: '🏪',
      title: 'Boutique',
      description: 'Shop from local boutiques',
      link: '/boutique'
    },
    {
      icon: '💊',
      title: 'Pharmacie',
      description: 'Get medicines delivered',
      link: '/pharmacy'
    },
    {
      icon: '🛒',
      title: 'Courses',
      description: 'Grocery shopping made easy',
      link: '/grocery'
    }
  ];
}