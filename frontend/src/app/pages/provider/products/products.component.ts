import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService, Product } from '../../../services/product.service';
import { AuthService } from '../../../services/auth.service';

// Using Product interface from ProductService

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule, FormsModule],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})
export class ProductsComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  searchTerm = '';
  selectedCategory = '';
  selectedStatus = '';
  loading = true;
  error = '';

  categories: any[] = [];
  categoryNames: string[] = [];
  statuses = ['active', 'inactive', 'out-of-stock'];
  currentStore: any = null;
  storeType = '';

  // Add Product Modal
  showAddProductModal = false;
  addingProduct = false;
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  
  // Edit Product Modal
  showEditProductModal = false;
  editingProduct = false;
  editingProductId: number | null = null;
  
  // New Product Form Data
  newProduct = {
    name: '',
    description: '',
    price: 0,
    category_id: '',
    prescription: false
  };
  
  // Edit Product Form Data
  editProduct_data = {
    name: '',
    description: '',
    price: 0,
    category_id: '',
    prescription: false,
    currentImage: ''
  };

  constructor(
    private productService: ProductService,
    private authService: AuthService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.loadUserStoreInfo();
    // Don't load products yet, wait for categories to load first
  }

  loadUserStoreInfo() {
    const userData = this.authService.getUserData();
    console.log('🏪 Current user data:', userData);
    if (userData && userData.role === 'provider') {
      this.currentStore = {
        id: userData.id,
        name: userData.storeName || userData.name || userData.nom,
        storeName: userData.storeName || userData.name || userData.nom,
        storeType: userData.storeType || userData.type || 'restaurant'
      };
      this.storeType = this.currentStore.storeType;
      console.log('🏪 Store info:', this.currentStore);
      this.setProductCategories();
    }
  }

  setProductCategories() {
    // Load categories from database based on store type
    const storeTypeForApi = this.storeType.toLowerCase() === 'pharmacie' ? 'pharmacy' : this.storeType.toLowerCase();
    
    this.productService.getCategories(storeTypeForApi).subscribe({
      next: (response) => {
        if (response.success && response.categories) {
          this.categories = response.categories;
          this.categoryNames = response.categories.map(cat => cat.name);
          console.log('📋 Categories loaded:', this.categories);
        } else {
          // Fallback to default categories if API fails
          this.setFallbackCategories();
        }
        // Load products after categories are ready
        this.loadProducts();
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.setFallbackCategories();
        // Load products even if categories fail
        this.loadProducts();
      }
    });
  }

  setFallbackCategories() {
    // Fallback categories if database loading fails
    let fallbackNames: string[] = [];
    switch (this.storeType.toLowerCase()) {
      case 'restaurant':
        fallbackNames = ['Pizza', 'Burger', 'Pasta', 'Salad', 'Dessert', 'Drink'];
        break;
      case 'pharmacie':
        fallbackNames = ['Medication', 'Vitamins', 'First Aid', 'Beauty', 'Baby Care'];
        break;
      case 'boutique':
        fallbackNames = ['Clothing', 'Accessories', 'Shoes', 'Electronics', 'Home'];
        break;
      default:
        fallbackNames = ['Food', 'Electronics', 'Health', 'Fashion', 'Other'];
    }
    this.categoryNames = fallbackNames;
    this.categories = fallbackNames.map((name, index) => ({ id: index + 1, name, type: this.storeType }));
    console.log('📋 Fallback categories set:', this.categories);
  }

  loadProducts() {
    this.loading = true;
    this.error = '';
    
    if (!this.currentStore || !this.currentStore.id) {
      this.error = 'Store information not available. Please login again.';
      this.loading = false;
      return;
    }
    
    // Use store ID for exact filtering
    const filters = {
      store_id: this.currentStore.id
    };
    
    console.log('🔍 Loading products for store ID:', this.currentStore.id);
    
    this.productService.getProducts(filters).subscribe({
      next: (response) => {
        console.log('📦 Products received for this store:', response.products.length);
        console.log('📦 Products data:', response.products);
        
        // Debug image URLs specifically
        response.products.forEach(product => {
          if (product.image) {
            console.log(`🖼️ Product "${product.name}" image URL:`, product.image);
          } else {
            console.log(`❌ Product "${product.name}" has no image`);
          }
        });
        
        this.products = response.products;
        this.filteredProducts = [...this.products]; // Show all products initially
        this.loading = false;
        console.log('✅ Products displayed:', this.filteredProducts.length);
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.error = 'Failed to load products. Please try again.';
        this.loading = false;
      }
    });
  }

  filterProducts() {
    this.filteredProducts = this.products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                           (product.description && product.description.toLowerCase().includes(this.searchTerm.toLowerCase()));
      
      // Category filtering - show all if no category selected
      let matchesCategory = true;
      if (this.selectedCategory && this.selectedCategory.trim() !== '') {
        matchesCategory = !!(product.category_name && product.category_name === this.selectedCategory) ||
                         !!(product.category_id && this.getCategoryNameById(product.category_id) === this.selectedCategory);
      }
      
      const matchesStatus = !this.selectedStatus || this.getProductStatus(product) === this.selectedStatus;
      
      console.log('🔍 Filtering product:', {
        product: product.name,
        matchesSearch,
        matchesCategory, 
        matchesStatus,
        selectedCategory: this.selectedCategory
      });
      
      return matchesSearch && matchesCategory && matchesStatus;
    });
    
    console.log('📊 Filtered products:', this.filteredProducts.length, 'of', this.products.length);
  }

  getCategoryNameById(categoryId: number): string {
    const category = this.categories.find(cat => cat.id === categoryId);
    return category ? category.name : '';
  }

  getProductCategory(product: Product): string {
    // First try to get category from database using category_id
    if (product.category_id) {
      const categoryName = this.getCategoryNameById(product.category_id);
      if (categoryName) return categoryName;
    }
    
    // Then try category_name if available
    if (product.category_name) {
      return product.category_name;
    }
    
    // Fallback: try to match with available categories based on product name
    const name = product.name.toLowerCase();
    for (const category of this.categories) {
      if (name.includes(category.name.toLowerCase())) {
        return category.name;
      }
    }
    
    return 'Uncategorized';
  }

  getProductStatus(product: Product): string {
    if (product.available === false) return 'inactive';
    return 'active';
  }

  addProduct() {
    this.resetAddProductForm();
    this.showAddProductModal = true;
  }

  closeAddProductModal() {
    this.showAddProductModal = false;
    this.resetAddProductForm();
  }

  resetAddProductForm() {
    this.newProduct = {
      name: '',
      description: '',
      price: 0,
      category_id: '',
      prescription: false
    };
    this.selectedFile = null;
    this.imagePreview = null;
  }

  closeEditProductModal() {
    this.showEditProductModal = false;
    this.resetEditProductForm();
  }

  resetEditProductForm() {
    this.editProduct_data = {
      name: '',
      description: '',
      price: 0,
      category_id: '',
      prescription: false,
      currentImage: ''
    };
    this.selectedFile = null;
    this.imagePreview = null;
    this.editingProductId = null;
  }

  onFileSelect(event: any) {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select only image files');
        return;
      }
      
      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }
      
      this.selectedFile = file;
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage() {
    this.selectedFile = null;
    this.imagePreview = null;
    
    // If in edit mode and there was a current image, show placeholder
    if (this.showEditProductModal && this.editProduct_data.currentImage) {
      // Reset to show placeholder (no image preview)
      this.imagePreview = null;
    }
  }

  onImageLoad(event: any, product: any) {
    console.log(`✅ Image loaded successfully for product "${product.name}":`, event.target.src);
  }

  onImageError(event: any) {
    console.error('🖼️ Image failed to load:', event.target.src);
    console.log('🔍 Image element:', event.target);
    
    // Hide broken images and show placeholder
    event.target.style.display = 'none';
    const placeholder = event.target.parentElement.querySelector('.product-image-placeholder');
    if (placeholder) {
      placeholder.style.display = 'flex';
    }
  }

  onSubmitProduct() {
    if (!this.newProduct.name || !this.newProduct.description || !this.newProduct.price || !this.newProduct.category_id) {
      alert('Please fill in all required fields');
      return;
    }

    if (!this.currentStore) {
      alert('Store information not available');
      return;
    }

    this.addingProduct = true;

    // Create FormData for file upload
    const formData = new FormData();
    formData.append('name', this.newProduct.name);
    formData.append('description', this.newProduct.description);
    formData.append('price', this.newProduct.price.toString());
    formData.append('category_id', this.newProduct.category_id);
    formData.append('store_id', this.currentStore.id.toString());
    formData.append('prescription', this.newProduct.prescription.toString());
    
    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }

    console.log('🚀 Submitting new product:', {
      name: this.newProduct.name,
      description: this.newProduct.description,
      price: this.newProduct.price,
      category_id: this.newProduct.category_id,
      store_id: this.currentStore.id,
      prescription: this.newProduct.prescription,
      hasImage: !!this.selectedFile
    });

    this.productService.createProduct(formData).subscribe({
      next: (response) => {
        console.log('✅ Product created successfully:', response);
        alert('Product created successfully!');
        this.closeAddProductModal();
        this.loadProducts(); // Refresh the products list
      },
      error: (error) => {
        console.error('❌ Error creating product:', error);
        alert(`Failed to create product: ${error.error?.error || error.message}`);
      },
      complete: () => {
        this.addingProduct = false;
      }
    });
  }

  onSubmitEditProduct() {
    console.log('📝 Edit product form submitted');
    console.log('📝 Form data:', this.editProduct_data);
    console.log('📝 Editing product ID:', this.editingProductId);
    
    if (!this.editProduct_data.name || !this.editProduct_data.description || this.editProduct_data.price <= 0 || !this.editProduct_data.category_id) {
      console.log('❌ Missing required fields');
      alert('Please fill in all required fields');
      return;
    }

    if (!this.editingProductId || !this.currentStore) {
      console.log('❌ Invalid product or store information');
      alert('Invalid product or store information');
      return;
    }

    console.log('✅ Starting product update...');
    this.editingProduct = true;

    // Create FormData for file upload (similar to add product)
    const formData = new FormData();
    formData.append('name', this.editProduct_data.name);
    formData.append('description', this.editProduct_data.description);
    formData.append('price', this.editProduct_data.price.toString());
    formData.append('category_id', this.editProduct_data.category_id);
    formData.append('store_id', this.currentStore.id.toString());
    formData.append('prescription', this.editProduct_data.prescription.toString());
    
    // Only append image if a new one was selected
    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }
    
    // Keep existing image if no new image selected
    if (!this.selectedFile && this.editProduct_data.currentImage) {
      formData.append('keepCurrentImage', 'true');
    }

    console.log('🔧 Updating product:', {
      id: this.editingProductId,
      name: this.editProduct_data.name,
      description: this.editProduct_data.description,
      price: this.editProduct_data.price,
      category_id: this.editProduct_data.category_id,
      store_id: this.currentStore.id,
      prescription: this.editProduct_data.prescription,
      hasNewImage: !!this.selectedFile,
      keepCurrentImage: !this.selectedFile && !!this.editProduct_data.currentImage
    });

    this.productService.updateProduct(this.editingProductId, formData).subscribe({
      next: (response) => {
        console.log('✅ Product updated successfully:', response);
        alert('Product updated successfully!');
        this.closeEditProductModal();
        this.loadProducts(); // Refresh the products list
      },
      error: (error) => {
        console.error('❌ Error updating product:', error);
        alert(`Failed to update product: ${error.error?.error || error.message}`);
      },
      complete: () => {
        this.editingProduct = false;
      }
    });
  }

  editProduct(productId: number) {
    console.log('🔧 Edit product clicked for ID:', productId);
    
    // Find the product to edit
    const product = this.products.find(p => p.id === productId);
    if (!product) {
      console.error('❌ Product not found with ID:', productId);
      alert('Product not found');
      return;
    }
    
    console.log('📦 Found product to edit:', product);
    
    // Reset form state first
    this.resetEditProductForm();
    
    // Populate form with existing product data
    this.editingProductId = productId;
    this.editProduct_data = {
      name: product.name || '',
      description: product.description || '',
      price: Number(product.price) || 0,
      category_id: product.category_id?.toString() || '',
      prescription: Boolean(product.prescription),
      currentImage: product.image || ''
    };
    
    // Set current image as preview if exists and is valid URL
    if (product.image && product.image.trim() !== '') {
      this.imagePreview = product.image;
      console.log('🖼️ Setting image preview:', product.image);
    }
    
    console.log('📝 Edit form data:', this.editProduct_data);
    console.log('🔧 Opening edit modal...');
    this.showEditProductModal = true;
  }

  deleteProduct(productId: number) {
    console.log('Delete product:', productId);
  }

  toggleStatus(productId: number) {
    const product = this.products.find(p => p.id === productId);
    if (product) {
      // Update product availability via API
      console.log('Toggle product status:', productId);
      // TODO: Implement API call to update product status
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'active': return '#10b981';
      case 'inactive': return '#6b7280';
      case 'out_of_stock': return '#e74c3c';
      default: return '#95a5a6';
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'active': return 'livre';
      case 'inactive': return 'en-attente';
      case 'out_of_stock': return 'annule';
      default: return '';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'active': return 'Actif';
      case 'inactive': return 'Inactif';
      case 'out_of_stock': return 'Rupture';
      default: return status;
    }
  }
}