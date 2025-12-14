import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
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
  sessionId?: string;
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
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials, {
      withCredentials: true // Enable cookies
    }).pipe(
      tap(response => {
        if (response.success && response.sessionId) {
          console.log('🍪 Session established → ID:', response.sessionId);
        }
      })
    );
  }

  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, data, {
      withCredentials: true // Enable cookies
    });
  }

  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/logout`, {}, {
      withCredentials: true // Send cookies with logout request
    });
  }

  // Check server-side session
  checkSession(): Observable<any> {
    return this.http.get(`${this.apiUrl}/session`, {
      withCredentials: true
    });
  }

  // Store token in localStorage
  saveToken(token: string): void {
    const oldToken = localStorage.getItem('auth_token');
    localStorage.setItem('auth_token', token);
    console.log('🎫 Token saved to localStorage');
    console.log('🔑 Token preview:', token.substring(0, 30) + '...');
    if (oldToken && oldToken !== token) {
      console.log('🔄 New token generated (different from previous session)');
    }
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
      // Try firstName first, then extract from name, then fallback to email
      const firstName = userData.firstName || userData.prenom;
      if (firstName) {
        return firstName;
      }
      
      if (userData.name) {
        return userData.name.split(' ')[0];
      }
      
      if (userData.email) {
        return userData.email.split('@')[0];
      }
      
      return 'User';
    }
    return '';
  }

  // Get full user name for display
  getFullUserName(): string {
    const userData = this.getUserData();
    if (userData) {
      const firstName = userData.firstName || userData.prenom || '';
      const lastName = userData.lastName || userData.nom || '';
      
      if (firstName && lastName) {
        return `${firstName} ${lastName}`;
      } else if (firstName) {
        return firstName;
      } else if (userData.name) {
        return userData.name;
      } else if (userData.email) {
        return userData.email.split('@')[0];
      }
      
      return 'User';
    }
    return '';
  }

  // Check if user is logged in
  isLoggedIn(): boolean {
    return !!this.getToken() && !!this.getUserData();
  }
}
