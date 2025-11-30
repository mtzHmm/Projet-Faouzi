import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: string;
  image: string;
  description: string;
  createdAt: Date;
}

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule, FormsModule],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})
export class ProductsComponent {
  products: Product[] = [
    {
      id: '#P001',
      name: 'Pizza Margherita',
      category: 'Restaurant',
      price: 18.50,
      stock: 25,
      status: 'active',
      image: '/pizza.jpg',
      description: 'Classic Italian pizza with fresh tomatoes and mozzarella',
      createdAt: new Date('2024-01-15')
    },
    {
      id: '#P002', 
      name: 'Smartphone Samsung',
      category: 'Electronics',
      price: 899.00,
      stock: 8,
      status: 'active',
      image: '/phone.jpg',
      description: 'Latest Samsung Galaxy smartphone with advanced features',
      createdAt: new Date('2024-02-10')
    },
    {
      id: '#P003',
      name: 'Paracetamol 500mg',
      category: 'Pharmacy',
      price: 5.20,
      stock: 0,
      status: 'out-of-stock',
      image: '/medicine.jpg',
      description: 'Pain relief medication, 20 tablets per box',
      createdAt: new Date('2024-01-28')
    }
  ];

  filteredProducts = [...this.products];
  searchTerm = '';
  selectedCategory = '';
  selectedStatus = '';

  categories = ['Restaurant', 'Electronics', 'Pharmacy', 'Grocery', 'Fashion'];
  statuses = ['active', 'inactive', 'out-of-stock'];

  filterProducts() {
    this.filteredProducts = this.products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                           product.category.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesCategory = !this.selectedCategory || product.category === this.selectedCategory;
      const matchesStatus = !this.selectedStatus || product.status === this.selectedStatus;
      
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }

  addProduct() {
    // Logic to add new product
    console.log('Add new product');
  }

  editProduct(productId: string) {
    console.log('Edit product:', productId);
  }

  deleteProduct(productId: string) {
    console.log('Delete product:', productId);
  }

  toggleStatus(productId: string) {
    const product = this.products.find(p => p.id === productId);
    if (product) {
      product.status = product.status === 'active' ? 'inactive' : 'active';
      this.filterProducts();
    }
  }
}