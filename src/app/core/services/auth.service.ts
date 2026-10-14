import { Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse, User } from '../models/models';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  currentUser = signal<User | null>(null);
  token = signal<string | null>(localStorage.getItem('kpm_admin_token'));
  
  isAuthenticated = computed(() => !!this.token());
  isAdmin = computed(() => {
    const user = this.currentUser();
    if (!user) return false;
    return user.role === 'admin' || user.email.toLowerCase() === 'admin@kpmacademy.com';
  });

  constructor(private api: ApiService, private router: Router) {
    this.initAuthFromStorage();
  }

  private initAuthFromStorage(): void {
    const savedUser = localStorage.getItem('kpm_admin_user');
    const savedToken = localStorage.getItem('kpm_admin_token');

    if (savedToken && savedUser) {
      try {
        const user = JSON.parse(savedUser) as User;
        this.currentUser.set(user);
        this.token.set(savedToken);
      } catch {
        this.logout();
      }
    }
  }

  login(credentials: { email: string; password: string }): Observable<ApiResponse<any>> {
    return this.api.post<any>('/auth/login', credentials).pipe(
      tap((res) => {
        if (res.success && res.data) {
          const token = res.data.token || res.data.tokens?.access_token;
          const user = res.data.user;

          if (token) {
            this.token.set(token);
            localStorage.setItem('kpm_admin_token', token);
          }
          if (user) {
            this.currentUser.set(user);
            localStorage.setItem('kpm_admin_user', JSON.stringify(user));
          }
        }
      })
    );
  }

  logout(): void {
    // Call server logout if possible
    if (this.token()) {
      this.api.post('/auth/logout', {}).subscribe({
        error: () => {},
      });
    }

    this.token.set(null);
    this.currentUser.set(null);
    localStorage.removeItem('kpm_admin_token');
    localStorage.removeItem('kpm_admin_user');

    this.router.navigate(['/login']);
  }

  // Clear the local session only (no server call). Used when the server answers 401.
  forceLogout(): void {
    this.token.set(null);
    this.currentUser.set(null);
    localStorage.removeItem('kpm_admin_token');
    localStorage.removeItem('kpm_admin_user');
    this.router.navigate(['/login']);
  }
}
