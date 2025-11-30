import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  price: number;
  supplier: string;
  lastUpdated: Date;
  status: string;
}

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule, FormsModule],
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.css']
})
export class InventoryComponent {
  inventory: InventoryItem[] = [
    {
      id: '#INV001',
      name: 'Pizza Margherita',
      category: 'Restaurant',
      currentStock: 25,
      minStock: 10,
      maxStock: 50,
      price: 18.50,
      supplier: 'Local Kitchen',
      lastUpdated: new Date('2024-11-30'),
      status: 'in-stock'
    },
    {
      id: '#INV002',
      name: 'Smartphone Samsung',
      category: 'Electronics',
      currentStock: 8,
      minStock: 5,
      maxStock: 20,
      price: 899.00,
      supplier: 'Samsung Tunisia',
      lastUpdated: new Date('2024-11-29'),
      status: 'low-stock'
    },
    {
      id: '#INV003',
      name: 'Paracetamol 500mg',
      category: 'Pharmacy',
      currentStock: 0,
      minStock: 20,
      maxStock: 100,
      price: 5.20,
      supplier: 'Pharma Distributors',
      lastUpdated: new Date('2024-11-28'),
      status: 'out-of-stock'
    },
    {
      id: '#INV004',
      name: 'Fresh Apples',
      category: 'Grocery',
      currentStock: 45,
      minStock: 15,
      maxStock: 60,
      price: 3.50,
      supplier: 'Local Farmers',
      lastUpdated: new Date('2024-11-30'),
      status: 'in-stock'
    }
  ];

  filteredInventory = [...this.inventory];
  searchTerm = '';
  selectedCategory = '';
  selectedStatus = '';

  categories = ['Restaurant', 'Electronics', 'Pharmacy', 'Grocery', 'Fashion'];
  statuses = ['in-stock', 'low-stock', 'out-of-stock', 'overstocked'];

  filterInventory() {
    this.filteredInventory = this.inventory.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                           item.supplier.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesCategory = !this.selectedCategory || item.category === this.selectedCategory;
      const matchesStatus = !this.selectedStatus || item.status === this.selectedStatus;
      
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }

  updateStock(itemId: string, newStock: number) {
    const item = this.inventory.find(i => i.id === itemId);
    if (item) {
      item.currentStock = newStock;
      item.lastUpdated = new Date();
      this.updateItemStatus(item);
      this.filterInventory();
    }
  }

  private updateItemStatus(item: InventoryItem) {
    if (item.currentStock === 0) {
      item.status = 'out-of-stock';
    } else if (item.currentStock <= item.minStock) {
      item.status = 'low-stock';
    } else if (item.currentStock >= item.maxStock) {
      item.status = 'overstocked';
    } else {
      item.status = 'in-stock';
    }
  }

  getStockPercentage(item: InventoryItem): number {
    return (item.currentStock / item.maxStock) * 100;
  }

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'in-stock': '#10b981',
      'low-stock': '#f59e0b',
      'out-of-stock': '#ef4444',
      'overstocked': '#8b5cf6'
    };
    return colors[status] || '#6b7280';
  }

  reorderItem(itemId: string) {
    console.log('Reorder item:', itemId);
  }

  editItem(itemId: string) {
    console.log('Edit item:', itemId);
  }

  // Getter methods for statistics
  get inStockCount(): number {
    return this.inventory.filter(item => item.status === 'in-stock').length;
  }

  get lowStockCount(): number {
    return this.inventory.filter(item => item.status === 'low-stock').length;
  }

  get outOfStockCount(): number {
    return this.inventory.filter(item => item.status === 'out-of-stock').length;
  }

  get totalInventoryValue(): number {
    return this.inventory.reduce((sum, item) => sum + (item.currentStock * item.price), 0);
  }
}