import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role?: string;
  phone?: string;
  address?: string;
  firstName?: string;
  lastName?: string;
  storeName?: string;
  storeCategory?: string;
  city?: string;
  availabilityTime?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: any;
  token?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient) {}

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials);
  }

  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, data);
  }

  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/logout`, {});
  }

  // Store token in localStorage
  saveToken(token: string): void {
    localStorage.setItem('auth_token', token);
  }

  // Get token from localStorage
  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  // Remove token from localStorage
  removeToken(): void {
    localStorage.removeItem('auth_token');
  }

  // Check if user is logged in
  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}
