import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';

export interface UserProfile {
  name: string;
  phone: string;
  email: string;
  city: string;
  address: string;
}

export interface SmtpConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  secure: boolean;
  senderEmail: string;
}

@Injectable({
  providedIn: 'root',
})
export class CdProfileDataServiceService {
  private readonly API_URL = 'http://127.0.0.1:2225/api';
  private userProfileSubject = new BehaviorSubject<UserProfile>({
    name: '',
    phone: '',
    email: '',
    city: '',
    address: '',
  });

  private smtp: SmtpConfig | null = {
    host: 'smtp.example.com',
    port: 587,
    username: 'user@example.com',
    password: 'password123',
    secure: false,
    senderEmail: 'noreply@example.com',
  };

  userProfile$ = this.userProfileSubject.asObservable();
  private smtpConfigSubject = new BehaviorSubject<SmtpConfig | null>(this.smtp);

  constructor(private http: HttpClient) {
    this.fetchUserProfileFromBackend();
  }

  getSmtpConfig(): Observable<SmtpConfig | null> {
    return this.smtpConfigSubject.asObservable();
  }

  setSmtpConfig(config: SmtpConfig): void {
    this.smtp = config;
    this.smtpConfigSubject.next(config);
  }

  public fetchUserProfileFromBackend(): void {
    const token = this.getToken();
    if (!token) {
      console.error('No token available');
      return;
    }

    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');

    console.log('Making request with token:', token);
    console.log('Full headers:', headers.keys().map((key: string) => `${key}: ${headers.get(key)}`));

    this.http
      .get<UserProfile>(`${this.API_URL}/accounts/profile/`, {
        headers,
        observe: 'response'
      })
      .subscribe({
        next: (response: HttpResponse<UserProfile>) => {
          console.log('Success Response:', response);
          if (response.body) {
            const data = response.body;
            this.userProfileSubject.next({
              name: data.name,
              phone: this.formatPhone(data.phone),
              email: data.email,
              city: data.city || '',
              address: data.address || '',
            });
          }
        },
        error: (error: any) => {
          console.error('Error Response:', {
            status: error.status,
            message: error.message,
            error: error.error,
            headers: error.headers?.keys().map((key: string) =>
              `${key}: ${error.headers?.get(key)}`
            ),
          });
        },
      });
  }

  private getToken(): string {
    const user = localStorage.getItem('user');
    console.log('Retrieved user from localStorage:', user);
    return user ? JSON.parse(user).token : '';
  }

  private formatPhone(phone: string): string {
    if (!phone) return '';
    return phone.startsWith('+') ? phone : `+91${phone}`;
  }

  getUserProfile(): UserProfile {
    return this.userProfileSubject.value;
  }

  updateUserProfile(profile: UserProfile): void {
    const formattedPhone = this.extractPhoneString(profile.phone);
    this.userProfileSubject.next({
      ...profile,
      phone: formattedPhone,
    });
  }

  private extractPhoneString(phone: unknown): string {
    if (typeof phone === 'string') {
      return this.formatPhone(phone);
    }
    if (phone && typeof phone === 'object' && 'e164Number' in phone) {
      return phone.e164Number as string;
    }
    return '';
  }
}