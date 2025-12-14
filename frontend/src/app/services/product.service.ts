import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  restaurant: string;
  type: string;
  store_id: number;
  image?: string;
  available?: boolean;
  category_id?: number;
  category_name?: string;
  prescription?: boolean;
}

export interface Category {
  id: number;
  name: string;
  type: string;
}

export interface ProductsResponse {
  products: Product[];
  total: number;
  page: number;
  totalPages: number;
  hasMore: boolean;
  store?: {
    id: number;
    name: string;
    type: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = `${environment.apiUrl}/products`;

  constructor(private http: HttpClient) {}

  getProducts(filters?: {
    type?: string;
    available?: boolean;
    search?: string;
    page?: number;
    limit?: number;
    store_id?: number;
    restaurant?: string;
  }): Observable<ProductsResponse> {
    let params = new HttpParams();
    
    if (filters?.type) params = params.set('type', filters.type);
    if (filters?.available !== undefined) params = params.set('available', filters.available.toString());
    if (filters?.search) params = params.set('search', filters.search);
    if (filters?.page) params = params.set('page', filters.page.toString());
    if (filters?.limit) params = params.set('limit', filters.limit.toString());
    if (filters?.store_id) params = params.set('store_id', filters.store_id.toString());
    if (filters?.restaurant) params = params.set('restaurant', filters.restaurant);

    return this.http.get<ProductsResponse>(this.apiUrl, { params });
  }

  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }

  createProduct(productData: FormData): Observable<{message: string, product: Product}> {
    return this.http.post<{message: string, product: Product}>(`${this.apiUrl}`, productData);
  }

  updateProduct(id: number, productData: FormData | Partial<Product>): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, productData);
  }

  deleteProduct(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // Helper methods for specific types
  getRestaurantProducts(): Observable<ProductsResponse> {
    return this.getProducts({ type: 'restaurant' });
  }

  getPharmacyProducts(): Observable<ProductsResponse> {
    return this.getProducts({ type: 'pharmacy' });
  }

  getBoutiqueProducts(): Observable<ProductsResponse> {
    return this.getProducts({ type: 'boutique' });
  }

  // Category methods
  getCategories(type: string = 'restaurant'): Observable<{success: boolean, categories: Category[], total: number}> {
    let params = new HttpParams();
    params = params.set('type', type);
    return this.http.get<{success: boolean, categories: Category[], total: number}>(`${this.apiUrl}/categories`, { params });
  }

  getProductsByCategory(categoryId: number, type: string = 'restaurant'): Observable<ProductsResponse> {
    return this.getProducts({ type }).pipe(
      map(response => ({
        ...response,
        products: response.products.filter(product => product.category_id === categoryId)
      }))
    );
  }
}
