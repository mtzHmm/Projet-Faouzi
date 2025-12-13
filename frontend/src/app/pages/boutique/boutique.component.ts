import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductService, Product } from '../../services/product.service';

interface BoutiqueProduct extends Product {
  category: string;
  store: string;
}

@Component({
  selector: 'app-boutique',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './boutique.component.html',
  styleUrl: './boutique.component.css'
})
export class BoutiqueComponent implements OnInit {
  
  constructor(private productService: ProductService) {}
  products: BoutiqueProduct[] = [];
  isLoading = true;
  error = '';
  
  ngOnInit() {
    this.loadProducts();
  }
  
  loadProducts() {
    this.isLoading = true;
    this.error = '';
    
    this.productService.getProducts({ type: 'boutique' }).subscribe({
      next: (response) => {
        console.log('✅ Boutique products loaded:', response.products);
        this.products = response.products.map(product => ({
          ...product,
          category: this.mapTypeToCategory(product.type),
          store: product.restaurant || 'Boutique Store'
        }));
        
        console.log('🔍 Mapped products:', this.products);
        console.log('🏷️ Categories found:', [...new Set(this.products.map(p => p.category))]);
        console.log('🔄 Setting isLoading to false...');
        
        this.isLoading = false;
        
        console.log('✅ isLoading is now:', this.isLoading);
        console.log('📊 filteredProducts count:', this.filteredProducts.length);
      },
      error: (error) => {
        console.error('❌ Error loading boutique products:', error);
        this.error = 'Erreur lors du chargement des produits';
        this.isLoading = false;
      }
    });
  }
  
  mapTypeToCategory(type: string): string {
    const categoryMap: { [key: string]: string } = {
      'boutique': 'Général',
      'clothes': 'Vêtements', 
      'vetements': 'Vêtements',
      'shoes': 'Chaussures',
      'chaussures': 'Chaussures',
      'accessories': 'Accessoires',
      'accessoires': 'Accessoires',
      'electronics': 'Électronique',
      'electronique': 'Électronique',
      'beauty': 'Beauté',
      'beaute': 'Beauté',
      'jewelry': 'Bijoux',
      'bijoux': 'Bijoux'
    };
    return categoryMap[type?.toLowerCase()] || 'Général';
  }

  cart: BoutiqueProduct[] = [];
  categories: string[] = ['Tous', 'Général', 'Vêtements', 'Chaussures', 'Accessoires', 'Électronique', 'Beauté', 'Bijoux', 'Autres'];
  selectedCategory: string = 'Tous';

  get filteredProducts(): BoutiqueProduct[] {
    console.log('🔍 Filtering - selectedCategory:', this.selectedCategory);
    console.log('🔍 Total products:', this.products.length);
    
    if (this.selectedCategory === 'Tous') {
      console.log('📋 Returning all products:', this.products.length);
      return this.products;
    }
    const filtered = this.products.filter(product => product.category === this.selectedCategory);
    console.log('📋 Filtered products:', filtered.length);
    return filtered;
  }

  addToCart(product: BoutiqueProduct): void {
    this.cart.push(product);
    console.log('🛒 Product added to cart:', product.name);
  }

  removeFromCart(product: BoutiqueProduct): void {
    const index = this.cart.findIndex(item => item.id === product.id);
    if (index > -1) {
      this.cart.splice(index, 1);
      console.log('🗑️ Product removed from cart:', product.name);
    }
  }

  getTotalPrice(): number {
    return this.cart.reduce((total, product) => total + product.price, 0);
  }

  getTotalItems(): number {
    return this.cart.length;
  }

  filterByCategory(category: string): void {
    this.selectedCategory = category;
  }

  getProductEmoji(category: string): string {
    const emojiMap: { [key: string]: string } = {
      'Général': '🛍️',
      'Vêtements': '👕',
      'Chaussures': '👟',
      'Accessoires': '👜',
      'Électronique': '📱',
      'Beauté': '💄',
      'Bijoux': '💎',
      'Autres': '🏷️'
    };
    return emojiMap[category] || '🛒';
  }
}