import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface User {
  id: number;
  name: string;
  nom?: string;
  prenom?: string;
  firstName?: string;
  email: string;
  role: string;
  status: string;
  phone?: string;
  tel?: string;
  userType?: string;
  gouvernorat?: string;
  ville?: string;
  gouv_client?: string;
  ville_client?: string;
  gouv_livreur?: string;
  ville_livraison?: string;
  gouv_magasin?: string;
  ville_magasin?: string;
  vehicule?: string;
  type?: string;
  createdAt: Date;
}

export interface UsersResponse {
  users: User[];
  total: number;
  page: number;
  totalPages: number;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/users`;
  private clientsUrl = `${environment.apiUrl}/clients`;
  private providersUrl = `${environment.apiUrl}/providers`;
  private deliveryUrl = `${environment.apiUrl}/delivery`;

  constructor(private http: HttpClient) {}

  getUsers(filters?: {
    role?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Observable<UsersResponse> {
    let params = new HttpParams();
    
    if (filters?.role) params = params.set('role', filters.role);
    if (filters?.status) params = params.set('status', filters.status);
    if (filters?.page) params = params.set('page', filters.page.toString());
    if (filters?.limit) params = params.set('limit', filters.limit.toString());

    return this.http.get<UsersResponse>(this.apiUrl, { params });
  }

  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  createUser(user: Partial<User>): Observable<User> {
    return this.http.post<User>(this.apiUrl, user);
  }

  updateUser(id: number, userData: any, userRole?: string): Observable<User> {
    console.log('🔄 UserService - Updating user:', id, 'role:', userRole);
    console.log('🔄 UserService - User data:', userData);
    
    // Remove frontend-only fields
    const dbData = { ...userData };
    delete dbData.id;
    delete dbData.userType;
    delete dbData.tableType;
    
    // Choose the correct endpoint based on user type
    let endpoint = '';
    switch (userRole) {
      case 'client':
        endpoint = this.clientsUrl;
        console.log('🎯 Using CLIENTS endpoint');
        break;
      case 'magasin':
        endpoint = this.providersUrl;
        console.log('🎯 Using PROVIDERS endpoint');
        break;
      case 'livreur':
        endpoint = this.deliveryUrl;
        console.log('🎯 Using DELIVERY endpoint');
        break;
      default:
        endpoint = this.apiUrl; // Fallback to old endpoint
        console.log('⚠️ Using fallback USERS endpoint');
    }
    
    console.log('🔄 UserService - Final data for backend:', dbData);
    console.log('📍 Sending to endpoint:', `${endpoint}/${id}`);
    
    return this.http.put<User>(`${endpoint}/${id}`, dbData);
  }

  deleteUser(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
