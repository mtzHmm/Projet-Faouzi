import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

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
export class HomeComponent {
  slogan = "Fast Delivery To Your Door.";
  
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