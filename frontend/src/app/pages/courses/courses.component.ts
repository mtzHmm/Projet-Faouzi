import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductService, Product } from '../../services/product.service';
import { CartService } from '../../services/cart.service';

interface CoursesProduct extends Product {
  unit?: string;
  inStock?: boolean;
}

@Component({
  selector: 'app-courses',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './courses.component.html',
  styleUrl: './courses.component.css'
})
export class CoursesComponent implements OnInit {
  
  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private cdr: ChangeDetectorRef
  ) {}
  
  products: CoursesProduct[] = [];
  isLoading = true;
  error = '';
  dataLoaded = false;
  
  oldProducts: CoursesProduct[] = [
    {
      id: 1,
      name: 'Pain de Mie Complet',
      description: 'Pain de mie complet aux céréales',
      price: 2.50,
      image: '/images/bread.jpg',
      restaurant: 'Boulangerie Martin',
      type: 'courses',
      store_id: 1,
      category_name: 'Boulangerie',
      unit: 'pièce',
      inStock: true
    },
    {
      id: 2,
      name: 'Lait Demi-Écrémé',
      description: 'Lait frais demi-écrémé 1L',
      price: 1.20,
      image: '/images/milk.jpg',
      restaurant: 'Ferme Durand',
      type: 'courses',
      store_id: 2,
      category_name: 'Produits Laitiers',
      unit: '1L',
      inStock: true
    },
    {
      id: 3,
      name: 'Bananes Bio',
      description: 'Bananes biologiques d\'Équateur',
      price: 2.99,
      image: '/images/bananas.jpg',
      restaurant: 'Bio Market',
      type: 'courses',
      store_id: 3,
      category_name: 'Fruits',
      unit: 'kg',
      inStock: true
    },
    {
      id: 4,
      name: 'Tomates Cerises',
      description: 'Tomates cerises fraîches de saison',
      price: 3.50,
      image: '/images/tomatoes.jpg',
      restaurant: 'Maraîcher Local',
      type: 'courses',
      store_id: 4,
      category_name: 'Légumes',
      unit: '250g',
      inStock: true
    },
    {
      id: 5,
      name: 'Poulet Fermier',
      description: 'Escalopes de poulet fermier',
      price: 8.99,
      image: '/images/chicken.jpg',
      restaurant: 'Boucherie Tradition',
      type: 'courses',
      store_id: 5,
      category_name: 'Viandes',
      unit: '500g',
      inStock: true
    },
    {
      id: 6,
      name: 'Saumon Frais',
      description: 'Filets de saumon d\'Atlantique',
      price: 15.99,
      image: '/images/salmon.jpg',
      restaurant: 'Poissonnerie des Halles',
      type: 'courses',
      store_id: 6,
      category_name: 'Poissons',
      unit: '300g',
      inStock: false
    },
    {
      id: 7,
      name: 'Yaourts Nature',
      description: 'Pack de 8 yaourts nature bio',
      price: 4.20,
      image: '/images/yogurt.jpg',
      restaurant: 'Ferme Durand',
      type: 'courses',
      store_id: 2,
      category_name: 'Produits Laitiers',
      unit: 'pack de 8',
      inStock: true
    },
    {
      id: 8,
      name: 'Pâtes Italiennes',
      description: 'Spaghettis artisanaux italiens',
      price: 3.80,
      image: '/images/pasta.jpg',
      restaurant: 'Épicerie Fine',
      type: 'courses',
      store_id: 7,
      category_name: 'Épicerie',
      unit: '500g',
      inStock: true
    },
    {
      id: 9,
      name: 'Fromage Camembert',
      description: 'Camembert de Normandie AOP',
      price: 4.50,
      image: '/images/camembert.jpg',
      restaurant: 'Fromagerie Artisanale',
      type: 'courses',
      store_id: 8,
      category_name: 'Fromages',
      unit: 'pièce',
      inStock: true
    },
    {
      id: 10,
      name: 'Pommes Golden',
      description: 'Pommes Golden délicieuses',
      price: 2.30,
      image: '/images/apples.jpg',
      restaurant: 'Verger du Soleil',
      type: 'courses',
      store_id: 9,
      category_name: 'Fruits',
      unit: 'kg',
      inStock: true
    }
  ];

  cartCount = 0;
  categories: string[] = ['All', 'Fruits', 'Légumes', 'Viandes', 'Poissons', 'Produits Laitiers', 'Fromages', 'Boulangerie', 'Épicerie'];
  selectedCategory: string = 'All';
  cart: any[] = []; // Cart items for display in template

  ngOnInit() {
    console.log('🚀 Initializing courses component');
    
    // Force immediate change detection to ensure proper initialization
    this.cdr.detectChanges();
    
    // Load products immediately - categories are already initialized
    this.loadAllCoursesProducts();
    
    // Subscribe to cart changes
    this.cartService.cart$.subscribe(() => {
      this.updateCartCount();
    });
    
    // Initialize cart count
    this.updateCartCount();
    
    // Load database categories in parallel (won't affect product display)
    this.loadCoursesCategoriesFromDB();
  }

  loadCoursesCategoriesFromDB() {
    console.log('🔍 Loading courses categories from database...');
    
    this.productService.getCategories('courses').subscribe({
      next: (response) => {
        console.log('✅ Courses categories API response:', response);
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
        console.error('❌ Error loading courses categories:', error);
        console.log('🔧 Using fallback categories');
      }
    });
  }

  loadAllCoursesProducts() {
    console.log('📦 Loading all courses products');
    this.isLoading = true;
    this.error = '';
    
    this.productService.getProducts({ type: 'courses' }).subscribe({
      next: (response) => {
        console.log('✅ Courses products API response:', response);
        
        if (response && response.products && Array.isArray(response.products)) {
          this.products = response.products.map(product => ({
            ...product,
            inStock: product.available !== false,
            unit: (product as any).unit || ''
          }));
          
          console.log('🔍 Mapped products count:', this.products.length);
          console.log('🔍 First few products:', this.products.slice(0, 3));
          console.log('🔍 Current selectedCategory:', this.selectedCategory);
          console.log('🔍 filteredProducts will show:', this.filteredProducts.length);
          
          if (this.products.length === 0) {
            console.log('⚠️ No courses products found in database, using fallback');
            this.products = this.oldProducts;
            this.error = '';
          } else {
            this.error = ''; // Clear any previous errors
            console.log('✅ Successfully loaded courses products from database');
          }
        } else {
          console.log('❌ Invalid response format or no products array, using fallback');
          this.products = this.oldProducts;
          this.error = '';
        }
        
        this.isLoading = false;
        this.dataLoaded = true;
        
        console.log('🔄 Triggering change detection...');
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('❌ Error loading courses products:', error);
        console.log('🔧 Using fallback products due to API error');
        this.products = this.oldProducts;
        this.error = ''; // Don't show error to user, just use fallback
        this.isLoading = false;
        this.dataLoaded = true;
        this.cdr.detectChanges();
      }
    });
  }

  get filteredProducts(): CoursesProduct[] {
    console.log('🔍 Filtering courses - selectedCategory:', this.selectedCategory);
    console.log('🔍 Total products:', this.products.length);
    
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

  addToCart(product: CoursesProduct): void {
    if (!product.inStock) {
      alert('Ce produit n\'est pas disponible en stock.');
      return;
    }
    this.cartService.addToCart(product, 'courses');
    this.updateCartCount();
  }

  removeFromCart(item: any): void {
    this.cartService.removeFromCart(item.id);
    this.updateCartCount();
  }

  updateCartCount(): void {
    // Count only courses items
    const allItems = this.cartService.getCartItems();
    this.cartCount = allItems
      .filter(item => item.type === 'courses')
      .reduce((sum, item) => sum + item.quantity, 0);
  }

  getTotalPrice(): number {
    // Calculate total only for courses items
    const allItems = this.cartService.getCartItems();
    return allItems
      .filter(item => item.type === 'courses')
      .reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  getTotalItems(): number {
    return this.cartCount;
  }

  filterByCategory(category: string): void {
    console.log('🔍 Filtering by category:', category);
    this.selectedCategory = category;
    
    if (!this.products || this.products.length === 0) {
      console.log('⚠️ No products loaded, loading now...');
      this.loadAllCoursesProducts();
    } else {
      this.cdr.detectChanges();
    }
  }

  getProductEmoji(category: string): string {
    const emojiMap: { [key: string]: string } = {
      'All': '🛒',
      'Fruits': '🍎',
      'Légumes': '🥕',
      'Viandes': '🥩',
      'Poissons': '🐟',
      'Produits Laitiers': '🥛',
      'Fromages': '🧀',
      'Boulangerie': '🥖',
      'Épicerie': '🏪'
    };
    return emojiMap[category] || '🛒';
  }
}