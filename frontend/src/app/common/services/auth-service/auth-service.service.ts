import { Injectable } from '@angular/core';
    import { HttpClient, HttpHeaders } from '@angular/common/http';
    import { Observable, tap, catchError, throwError } from 'rxjs';
    import { UserCredentials, LoggedInUser } from './auth';

    @Injectable({
      providedIn: 'root',
    })
    export class AuthServiceService {
      private readonly loginUrl = 'http://127.0.0.1:2225/api/accounts/login/';
      private readonly logoutUrl = 'http://127.0.0.1:2225/api/accounts/logout/';
      private readonly userInfoUrl = 'http://127.0.0.1:2225/api/accounts/profile/';

      constructor(private http: HttpClient) {}

      logIn(email: string, password: string): Observable<LoggedInUser> {
        return this.http.post<LoggedInUser>(this.loginUrl, { email, password }).pipe(
          tap((user) => {
            localStorage.setItem('user', JSON.stringify({
                id: user.id,
                token: user.token,
                username: user.username,
                email: user.email,
                phone: user.phone,
            }));
          })
        );
      }

      getToken(): string | null {
        return localStorage.getItem('token');
      }

      getUserInfo(): Observable<any> {
        const token = this.getToken();
        if (!token) {
          return throwError(() => new Error('No token found'));
        }
        const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
        return this.http.post<any>(this.userInfoUrl, {}, { headers }).pipe(
          catchError((error) => {
            console.error('Error fetching user info:', error);
            return throwError(() => new Error('Failed to fetch user info'));
          })
        );
      }

      logout(): void {
        const token = this.getToken();
        if (!token) {
          this.clearLocalStorage();
          return;
        }
        const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
        this.http.post(this.logoutUrl, {}, { headers }).subscribe({
          next: () => this.clearLocalStorage(),
          error: () => this.clearLocalStorage()
        });
      }

      private clearLocalStorage(): void {
        localStorage.removeItem('user');
    python mnaanarunsderver erver 82225}
    }