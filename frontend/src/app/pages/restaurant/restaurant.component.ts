import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { ProductService, Product, Category } from '../../services/product.service';

@Component({
  selector: 'app-restaurant',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './restaurant.component.html',
  styleUrl: './restaurant.component.css'
})
export class RestaurantComponent implements OnInit {
  cartItems: Product[] = [];
  products: Product[] = [];
  allProducts: Product[] = [];
  categories: Category[] = [];
  selectedCategory: number | null = null;
  loading = true;
  loadingCategories = true;
  error: string | null = null;

  constructor(
    private productService: ProductService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadProducts();
    this.loadCategories();
  }

  loadProducts() {
    this.loading = true;
    this.error = null;
    
    this.productService.getRestaurantProducts().subscribe({
      next: (response: any) => {
        console.log('🍽️ Products API response:', response);
        
        if (response && response.products && Array.isArray(response.products)) {
          // API returned products with proper structure
          console.log('✅ Loaded products from database:', response.products.length, 'products');
          this.allProducts = response.products.map((product: any) => ({
            ...product,
            price: typeof product.price === 'number' ? product.price / 100 : product.price // Convert from cents to DT if needed
          }));
          this.products = this.allProducts;
        } else if (Array.isArray(response)) {
          // API returned direct array
          console.log('✅ Loaded products array from database:', response.length, 'products');
          this.allProducts = response;
          this.products = response;
        } else {
          // Fallback to static products
          console.log('⚠️ Invalid API response, using static products');
          this.allProducts = this.staticProducts;
          this.products = this.staticProducts;
        }
        
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        console.error('❌ Error loading products from API:', error);
        console.log('🔄 Falling back to static products');
        this.allProducts = this.staticProducts;
        this.products = this.staticProducts;
        this.loading = false;
        this.error = null;
        this.cdr.detectChanges();
      }
    });
  }

  loadCategories() {
    this.loadingCategories = true;
    
    this.productService.getCategories('restaurant').subscribe({
      next: (response: any) => {
        console.log('📋 Categories API response:', response);
        if (response && response.success && response.categories) {
          this.categories = response.categories;
          console.log('✅ Loaded categories from database:', this.categories);
        } else {
          // Fallback to static categories if API response is invalid
          console.log('⚠️ Invalid API response, using static categories');
          this.categories = this.staticCategories;
        }
        this.loadingCategories = false;
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        console.error('❌ Error loading categories from API:', error);
        console.log('🔄 Falling back to static categories');
        // Use static categories as fallback
        this.categories = this.staticCategories;
        this.loadingCategories = false;
        this.cdr.detectChanges();
      }
    });
  }

  // Backup static products in case API fails
  // Temporary static categories for immediate functionality
  staticCategories: Category[] = [
    { id: 1, name: "Pizzas", type: "restaurant" },
    { id: 2, name: "Fast-food", type: "restaurant" },
    { id: 3, name: "Plats préparés", type: "restaurant" },
    { id: 4, name: "Desserts", type: "restaurant" },
    { id: 5, name: "Boissons", type: "restaurant" }
  ];

  staticProducts: Product[] = [
    {
      id: 1,
      name: "Pizza Margherita",
      description: "Pizza classique avec tomates, mozzarella et basilic frais",
      price: 18.50,
      image: "🍕",
      type: "restaurant",
      restaurant: "Bella Italia",
      store_id: 1,
      category_id: 1,
      category_name: "Pizzas"
    },
    {
      id: 2,
      name: "Burger Royal",
      description: "Burger avec steak, fromage, salade, tomate et sauce spéciale",
      price: 22.00,
      image: "🍔",
      type: "restaurant",
      restaurant: "Fast Gourmet",
      store_id: 2,
      category_id: 2,
      category_name: "Fast-food"
    },
    {
      id: 3,
      name: "Sushi Mix",
      description: "Assortiment de 12 sushi variés avec wasabi et gingembre",
      price: 28.00,
      image: "🍣",
      type: "restaurant",
      restaurant: "Tokyo Express",
      store_id: 3,
      category_id: 3,
      category_name: "Plats préparés"
    },
    {
      id: 4,
      name: "Tacos Mexicains",
      description: "3 tacos au poulet avec guacamole, salsa et coriandre",
      price: 16.50,
      image: "🌮",
      type: "restaurant",
      restaurant: "El Sombrero",
      store_id: 4,
      category_id: 2,
      category_name: "Fast-food"
    },
    {
      id: 5,
      name: "Pâtes Carbonara",
      description: "Spaghetti à la carbonara avec lardons et parmesan",
      price: 19.00,
      image: "🍝",
      type: "restaurant",
      restaurant: "Bella Italia",
      store_id: 1,
      category_id: 3,
      category_name: "Plats préparés"
    },
    {
      id: 6,
      name: "Salade César",
      description: "Salade fraîche avec poulet grillé, croûtons et parmesan",
      price: 14.50,
      image: "🥗",
      type: "restaurant",
      restaurant: "Green Garden",
      store_id: 5,
      category_id: 3,
      category_name: "Plats préparés"
    },
    {
      id: 7,
      name: "Coca Cola",
      description: "Boisson gazeuse rafraîchissante 33cl",
      price: 3.50,
      image: "🥤",
      type: "restaurant",
      restaurant: "Fast Gourmet",
      store_id: 2,
      category_id: 5,
      category_name: "Boissons"
    },
    {
      id: 8,
      name: "Tiramisu",
      description: "Dessert italien aux biscuits, café et mascarpone",
      price: 8.00,
      image: "🧁",
      type: "restaurant",
      restaurant: "Bella Italia",
      store_id: 1,
      category_id: 4,
      category_name: "Desserts"
    }
  ];

  addToCart(product: Product) {
    this.cartItems.push(product);
    alert(`${product.name} ajouté au panier !`);
  }

  getTotalPrice(): number {
    return this.cartItems.reduce((total, item) => total + item.price, 0);
  }

  filterByCategory(categoryId: number | null) {
    this.selectedCategory = categoryId;
    
    console.log('🔍 Filtering by category ID:', categoryId);
    console.log('📦 Total products available:', this.allProducts.length);
    
    if (categoryId === null) {
      // Show all products
      this.products = [...this.allProducts];
      console.log('✅ Showing all products:', this.products.length);
    } else {
      // Filter products by category
      this.products = this.allProducts.filter(product => {
        console.log(`Product ${product.name}: category_id=${product.category_id}, matches=${product.category_id === categoryId}`);
        return product.category_id === categoryId;
      });
      console.log('✅ Filtered products:', this.products.length);
    }
    
    this.cdr.detectChanges();
  }

  isSelectedCategory(categoryId: number | null): boolean {
    return this.selectedCategory === categoryId;
  }

  getProductEmoji(productName: string): string {
    const name = productName.toLowerCase();
    
    if (name.includes('burger') || name.includes('royal')) return '🍔';
    if (name.includes('pizza')) return '🍕';
    if (name.includes('sushi')) return '🍣';
    if (name.includes('taco')) return '🌮';
    if (name.includes('pasta') || name.includes('spaghetti')) return '🍝';
    if (name.includes('salade') || name.includes('salad')) return '🥗';
    if (name.includes('sandwich')) return '🥪';
    if (name.includes('frites') || name.includes('fries')) return '🍟';
    if (name.includes('poulet') || name.includes('chicken')) return '🍗';
    if (name.includes('poisson') || name.includes('fish')) return '🐟';
    
    return '🍽️'; // Emoji par défaut
  }

  getCategoryEmoji(categoryName: string): string {
    const name = categoryName.toLowerCase();
    
    if (name.includes('pizza')) return '🍕';
    if (name.includes('fast-food') || name.includes('fast food')) return '🍔';
    if (name.includes('dessert')) return '🧁';
    if (name.includes('plat') || name.includes('préparé')) return '🍽️';
    if (name.includes('boisson')) return '🥤';
    if (name.includes('salade')) return '🥗';
    if (name.includes('sandwich')) return '🥪';
    if (name.includes('pasta') || name.includes('pâte')) return '🍝';
    
    return '🍴'; // Emoji par défaut
  }
}