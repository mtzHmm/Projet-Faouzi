import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
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
  private authStatusSubject = new BehaviorSubject<boolean>(this.isLoggedIn());
  public authStatus$ = this.authStatusSubject.asObservable();

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
    this.authStatusSubject.next(true);
  }

  // Get token from localStorage
  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  // Remove token from localStorage
  removeToken(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    this.authStatusSubject.next(false);
  }

  // Store user data in localStorage
  saveUserData(user: any): void {
    localStorage.setItem('user_data', JSON.stringify(user));
    this.authStatusSubject.next(true);
  }

  // Get user data from localStorage
  getUserData(): any {
    const userData = localStorage.getItem('user_data');
    return userData ? JSON.parse(userData) : null;
  }

  // Get user name for display (first name only)
  getUserName(): string {
    const userData = this.getUserData();
    if (userData) {
      // Return only firstName field, fallback to extracting from name or email
      return userData.firstName || userData.prenom || userData.name?.split(' ')[0] || userData.email?.split('@')[0] || 'User';
    }
    return '';
  }

  // Check if user is logged in
  isLoggedIn(): boolean {
    return !!this.getToken() && !!this.getUserData();
  }
}
