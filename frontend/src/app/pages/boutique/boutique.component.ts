import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductService, Product } from '../../services/product.service';
import { CartService } from '../../services/cart.service';

interface BoutiqueProduct extends Product {
  // Extends Product with all base properties
}

@Component({
  selector: 'app-boutique',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './boutique.component.html',
  styleUrl: './boutique.component.css'
})
export class BoutiqueComponent implements OnInit {
  
  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private cdr: ChangeDetectorRef
  ) {}
  products: BoutiqueProduct[] = [];
  isLoading = true;  // Start with true to show loading spinner
  error = '';
  dataLoaded = false;  // Track if initial data has been loaded
  

  
  initializeFallbackCategories() {
    console.log('🔧 Categories already initialized');
    console.log('🏷️ Current categories:', this.categories);
    console.log('🏷️ Current selected category:', this.selectedCategory);
  }
  
  ngOnInit() {
    console.log('🚀 Initializing boutique component');
    console.log('🏷️ Initial categories:', this.categories);
    console.log('🏷️ Initial selectedCategory:', this.selectedCategory);
    
    // Force immediate change detection to ensure proper initialization
    this.cdr.detectChanges();
    
    // Load products immediately - categories are already initialized
    this.loadAllBoutiqueProducts();
    
    // Load database categories in parallel (won't affect product display)
    this.loadBoutiqueCategoriesFromDB();
    
    // Subscribe to cart changes
    this.cartService.cart$.subscribe(() => {
      this.updateCartCount();
    });
    
    // Initialize cart count
    this.updateCartCount();
  }
  
  loadBoutiqueCategoriesFromDB() {
    console.log('🔍 Loading boutique categories from database...');
    
    this.productService.getCategories('boutique').subscribe({
      next: (response) => {
        console.log('✅ Boutique categories API response:', response);
        if (response && response.categories && response.categories.length > 0) {
          // Get category names and add "All" button
          const dbCategories = response.categories.map(cat => cat.name);
          const newCategories = ['All', ...dbCategories];
          
          console.log('🏷️ Categories from DB:', dbCategories);
          console.log('🏷️ New categories with All:', newCategories);
          
          // Only update categories if different, preserve selectedCategory
          if (JSON.stringify(this.categories) !== JSON.stringify(newCategories)) {
            this.categories = newCategories;
            console.log('🏷️ Categories updated, keeping selectedCategory:', this.selectedCategory);
            this.cdr.detectChanges();
          }
        } else {
          console.log('⚠️ No categories from DB response, keeping fallback');
        }
      },
      error: (error) => {
        console.error('❌ Error loading boutique categories:', error);
        console.log('🔧 Using fallback categories');
      }
    });
  }
  
  loadAllBoutiqueProducts() {
    console.log('📦 Loading all boutique products');
    this.isLoading = true;
    this.error = '';
    
    this.productService.getProducts({ type: 'boutique' }).subscribe({
      next: (response) => {
        console.log('✅ Boutique products API response:', response);
        
        if (response && response.products) {
          this.products = response.products.map(product => ({
            ...product
          }));
          
          console.log('🔍 Mapped products count:', this.products.length);
          console.log('🔍 First few products:', this.products.slice(0, 3));
          console.log('🔍 Current selectedCategory:', this.selectedCategory);
          console.log('🔍 filteredProducts will show:', this.filteredProducts.length);
          
          if (this.products.length === 0) {
            console.log('⚠️ No boutique products found in database');
            this.error = 'Aucun produit boutique trouvé dans la base de données';
          } else {
            this.error = ''; // Clear any previous errors
          }
        } else {
          console.log('❌ Invalid response format:', response);
          this.error = 'Réponse invalide du serveur';
        }
        
        this.isLoading = false;
        this.dataLoaded = true;
        
        // Set categories if not already set
        if (this.categories.length === 0) {
          this.categories = ['All', 'Vêtements', 'Chaussures', 'Accessoires', 'Électronique', 'Beauté', 'Bijoux'];
        }
        
        // Force change detection to update the view
        console.log('🔄 Triggering change detection...');
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('❌ Error loading boutique products:', error);
        console.error('❌ Full error details:', JSON.stringify(error, null, 2));
        this.error = `Erreur lors du chargement des produits: ${error.message || 'Erreur inconnue'}`;
        this.isLoading = false;
      }
    });
  }
  
  loadAllProducts() {
    // This method is kept for retry functionality
    this.loadBoutiqueCategoriesFromDB();
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

  categories: string[] = [];  // Start empty, will be populated after loading
  selectedCategory: string = 'All';
  cartCount = 0;
  cart: any[] = []; // Cart items for display in template

  get filteredProducts(): BoutiqueProduct[] {
    console.log('🔍 Filtering - selectedCategory:', this.selectedCategory);
    console.log('🔍 Total products:', this.products.length);
    
    // Don't filter if no products are loaded yet or if "All" is selected
    if (!this.products || this.products.length === 0) {
      console.log('⚠️ No products loaded yet');
      return [];
    }
    
    if (!this.selectedCategory || this.selectedCategory === '' || this.selectedCategory === 'All') {
      console.log('⚠️ Showing all products for "All" category');
      return this.products;
    }
    
    const filtered = this.products.filter(product => {
      return product.category_name === this.selectedCategory;
    });
    console.log('📋 Filtered products:', filtered.length);
    return filtered;
  }

  addToCart(product: BoutiqueProduct): void {
    this.cartService.addToCart(product, 'boutique');
    this.updateCartCount();
  }

  removeFromCart(item: any): void {
    this.cartService.removeFromCart(item.id);
    this.updateCartCount();
  }

  updateCartCount(): void {
    // Count only boutique items
    const allItems = this.cartService.getCartItems();
    this.cartCount = allItems
      .filter(item => item.type === 'boutique')
      .reduce((sum, item) => sum + item.quantity, 0);
  }

  getTotalItems(): number {
    return this.cartCount;
  }

  getTotalPrice(): number {
    // Calculate total only for boutique items
    const allItems = this.cartService.getCartItems();
    return allItems
      .filter(item => item.type === 'boutique')
      .reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  filterByCategory(category: string): void {
    console.log('🔍 Filtering by category:', category);
    this.selectedCategory = category;
    console.log('🏷️ Categories array:', this.categories);
    console.log('🏷️ Selected category set to:', this.selectedCategory);
    console.log('🔍 Current products count:', this.products.length);
    
    // If no products are loaded yet, load them now
    if (!this.products || this.products.length === 0) {
      console.log('⚠️ No products loaded, loading now...');
      this.loadAllBoutiqueProducts();
    } else {
      // Force change detection when category changes
      this.cdr.detectChanges();
    }
  }
  


  getProductEmoji(category: string): string {
    const emojiMap: { [key: string]: string } = {
      'All': '🛍️',
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