import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductService, Product } from '../../services/product.service';

interface PharmacieProduct extends Product {
  prescription?: boolean;
}

@Component({
  selector: 'app-pharmacie',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './pharmacie.component.html',
  styleUrl: './pharmacie.component.css'
})
export class PharmacieComponent implements OnInit {
  
  constructor(
    private productService: ProductService,
    private cdr: ChangeDetectorRef
  ) {}
  
  products: PharmacieProduct[] = [];
  isLoading = true;
  error = '';
  dataLoaded = false;
  
  oldProducts: PharmacieProduct[] = [
    {
      id: 1,
      name: 'Paracétamol 1g',
      description: 'Médicament contre la douleur et la fièvre',
      price: 3.50,
      image: '/images/paracetamol.jpg',
      restaurant: 'Pharmacie Centrale',
      type: 'pharmacie',
      store_id: 1,
      category_name: 'Médicaments',
      prescription: false
    },
    {
      id: 2,
      name: 'Vitamine C 500mg',
      description: 'Complément alimentaire vitamine C',
      price: 8.99,
      image: '/images/vitamin-c.jpg',
      restaurant: 'Pharmacie Centrale',
      type: 'pharmacie',
      store_id: 1,
      category_name: 'Vitamines'
    },
    {
      id: 3,
      name: 'Thermomètre Digital',
      description: 'Thermomètre médical précis',
      price: 12.99,
      image: '/images/thermometer.jpg',
      restaurant: 'Pharmacie du Centre',
      type: 'pharmacie',
      store_id: 2,
      category_name: 'Matériel Médical'
    },
    {
      id: 4,
      name: 'Masques Chirurgicaux',
      description: 'Boîte de 50 masques chirurgicaux',
      price: 15.99,
      image: '/images/masks.jpg',
      restaurant: 'Pharmacie du Centre',
      type: 'pharmacie',
      store_id: 2,
      category_name: 'Protection'
    },
    {
      id: 5,
      name: 'Gel Hydroalcoolique',
      description: 'Gel désinfectant pour les mains 250ml',
      price: 4.50,
      image: '/images/hand-gel.jpg',
      restaurant: 'Pharmacie Moderne',
      type: 'pharmacie',
      store_id: 3,
      category_name: 'Hygiène'
    },
    {
      id: 6,
      name: 'Tensiodomètre',
      description: 'Appareil de mesure de tension artérielle',
      price: 45.99,
      image: '/images/blood-pressure.jpg',
      restaurant: 'Pharmacie Moderne',
      type: 'pharmacie',
      store_id: 3,
      category_name: 'Matériel Médical'
    },
    {
      id: 7,
      name: 'Crème Hydratante',
      description: 'Crème hydratante pour peaux sensibles',
      price: 12.50,
      image: '/images/moisturizer.jpg',
      restaurant: 'Pharmacie Beauté',
      type: 'pharmacie',
      store_id: 4,
      category_name: 'Cosmétiques'
    },
    {
      id: 8,
      name: 'Antibiotique',
      description: 'Amoxicilline 500mg - Sur ordonnance',
      price: 18.90,
      image: '/images/antibiotic.jpg',
      restaurant: 'Pharmacie Centrale',
      type: 'pharmacie',
      store_id: 1,
      category_name: 'Médicaments',
      prescription: true
    }
  ];

  cart: PharmacieProduct[] = [];
  categories: string[] = ['All', 'Médicaments', 'Vitamines', 'Matériel Médical', 'Protection', 'Hygiène', 'Cosmétiques'];
  selectedCategory: string = 'All';

  ngOnInit() {
    console.log('🚀 Initializing pharmacie component');
    
    // Force immediate change detection to ensure proper initialization
    this.cdr.detectChanges();
    
    // Load products immediately - categories are already initialized
    this.loadAllPharmacieProducts();
    
    // Load database categories in parallel (won't affect product display)
    this.loadPharmacieCategoriesFromDB();
  }

  loadPharmacieCategoriesFromDB() {
    console.log('🔍 Loading pharmacie categories from database...');
    
    this.productService.getCategories('pharmacie').subscribe({
      next: (response) => {
        console.log('✅ Pharmacie categories API response:', response);
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
        console.error('❌ Error loading pharmacie categories:', error);
        console.log('🔧 Using fallback categories');
      }
    });
  }

  loadAllPharmacieProducts() {
    console.log('📦 Loading all pharmacie products');
    this.isLoading = true;
    this.error = '';
    
    this.productService.getProducts({ type: 'pharmacie' }).subscribe({
      next: (response) => {
        console.log('✅ Pharmacie products API response:', response);
        
        if (response && response.products && Array.isArray(response.products)) {
          this.products = response.products.map(product => ({
            ...product,
            prescription: product.prescription || false
          }));
          
          console.log('🔍 Mapped products count:', this.products.length);
          console.log('🔍 First few products:', this.products.slice(0, 3));
          console.log('🔍 Current selectedCategory:', this.selectedCategory);
          console.log('🔍 filteredProducts will show:', this.filteredProducts.length);
          
          if (this.products.length === 0) {
            console.log('⚠️ No pharmacie products found in database, using fallback');
            this.products = this.oldProducts;
            this.error = '';
          } else {
            this.error = ''; // Clear any previous errors
            console.log('✅ Successfully loaded pharmacie products from database');
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
        console.error('❌ Error loading pharmacie products:', error);
        console.log('🔧 Using fallback products due to API error');
        this.products = this.oldProducts;
        this.error = ''; // Don't show error to user, just use fallback
        this.isLoading = false;
        this.dataLoaded = true;
        this.cdr.detectChanges();
      }
    });
  }

  mapTypeToCategory(type: string): string {
    const categoryMap: { [key: string]: string } = {
      'pharmacie': 'Médicaments',
      'medicaments': 'Médicaments',
      'medicines': 'Médicaments', 
      'vitamines': 'Vitamines',
      'vitamins': 'Vitamines',
      'materiel': 'Matériel Médical',
      'medical': 'Matériel Médical',
      'protection': 'Protection',
      'hygiene': 'Hygiène',
      'cosmetiques': 'Cosmétiques',
      'cosmetics': 'Cosmétiques'
    };
    return categoryMap[type?.toLowerCase()] || 'Médicaments';
  }

  get filteredProducts(): PharmacieProduct[] {
    console.log('🔍 Filtering pharmacie - selectedCategory:', this.selectedCategory);
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

  addToCart(product: PharmacieProduct): void {
    if (product.prescription) {
      alert('Ce médicament nécessite une ordonnance. Veuillez consulter votre médecin.');
      return;
    }
    this.cart.push(product);
    console.log('🛒 Product added to cart:', product.name);
  }

  removeFromCart(product: PharmacieProduct): void {
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
    console.log('🔍 Filtering by category:', category);
    this.selectedCategory = category;
    
    if (!this.products || this.products.length === 0) {
      console.log('⚠️ No products loaded, loading now...');
      this.loadAllPharmacieProducts();
    } else {
      this.cdr.detectChanges();
    }
  }

  getProductEmoji(category: string): string {
    const emojiMap: { [key: string]: string } = {
      'All': '🏥',
      'Médicaments': '💊',
      'Vitamines': '🍋',
      'Matériel Médical': '🩺',
      'Protection': '😷',
      'Hygiène': '🧴',
      'Cosmétiques': '💄'
    };
    return emojiMap[category] || '💊';
  }
}