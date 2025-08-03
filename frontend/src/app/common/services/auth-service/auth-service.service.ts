import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { UserCredentials, LoggedInUser } from './auth';

@Injectable({
  providedIn: 'root',
})
export class AuthServiceService {
  private readonly loginUrl = 'http://127.0.0.1:2225/api-user-login/';

  constructor(private http: HttpClient) {}

  logIn(email: string, password: string): Observable<LoggedInUser> {
    return this.http.post<LoggedInUser>(this.loginUrl, { email, password }).pipe(
      tap((user) => {
        // Store required data in localStorage
        localStorage.setItem('token', user.token);
        localStorage.setItem('id', String(user.id));
        localStorage.setItem('username', user.username);
        localStorage.setItem('phone', user.phone);
      })
    );
  }

  // Optional: Methods to retrieve values
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getUserInfo(): { id: string | null; username: string | null; phone: string | null } {
    return {
      id: localStorage.getItem('id'),
      username: localStorage.getItem('username'),
      phone: localStorage.getItem('phone')
    };
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('id');
    localStorage.removeItem('username');
    localStorage.removeItem('phone');
  }
}
