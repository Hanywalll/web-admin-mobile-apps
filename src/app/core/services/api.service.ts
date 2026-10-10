import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { ApiResponse } from '../models/models';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private defaultApiUrl = 'http://localhost:8080/api/v1';
  baseUrl = signal<string>(localStorage.getItem('kpm_api_url') || this.defaultApiUrl);

  constructor(private http: HttpClient) {}

  setBaseUrl(url: string): void {
    const cleanUrl = url.replace(/\/+$/, '');
    this.baseUrl.set(cleanUrl);
    localStorage.setItem('kpm_api_url', cleanUrl);
  }

  resetBaseUrl(): void {
    this.setBaseUrl(this.defaultApiUrl);
  }

  get<T>(endpoint: string, params?: HttpParams | { [param: string]: string | number | boolean }): Observable<ApiResponse<T>> {
    return this.http.get<ApiResponse<T>>(`${this.baseUrl()}${endpoint}`, { params }).pipe(
      catchError(this.handleError)
    );
  }

  post<T>(endpoint: string, body: any): Observable<ApiResponse<T>> {
    return this.http.post<ApiResponse<T>>(`${this.baseUrl()}${endpoint}`, body).pipe(
      catchError(this.handleError)
    );
  }

  put<T>(endpoint: string, body: any): Observable<ApiResponse<T>> {
    return this.http.put<ApiResponse<T>>(`${this.baseUrl()}${endpoint}`, body).pipe(
      catchError(this.handleError)
    );
  }

  delete<T>(endpoint: string): Observable<ApiResponse<T>> {
    return this.http.delete<ApiResponse<T>>(`${this.baseUrl()}${endpoint}`).pipe(
      catchError(this.handleError)
    );
  }

  checkHealth(): Observable<any> {
    return this.http.get(`${this.baseUrl()}/health`).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: any) {
    let errorMessage = 'Terjadi kesalahan pada server API Go.';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Client Error: ${error.error.message}`;
    } else if (error.error && error.error.message) {
      errorMessage = error.error.message;
    } else if (error.status) {
      errorMessage = `Server Error (${error.status}): ${error.statusText || 'Gagal terhubung ke Go API'}`;
    }
    return throwError(() => new Error(errorMessage));
  }
}
