import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';

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

  @Injectable({
    providedIn: 'root',
  })

  public fetchUserProfileFromBackend(): void {
    const token = this.getToken();
    if (!token) return;

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http
      .get<any>('http://localhost:2225/api/accounts/profile/', { headers })
      .subscribe({
        next: (data) => {
          console.log('Profile Response from Backend:', data);
          console.log('Local Stored data:', localStorage.getItem('user'));
          this.userProfileSubject.next({
            name: data.name,
            phone: this.formatPhone(data.phone),
            email: data.email,
            city: data.city || '',
            address: data.address || '',
          });
        },
        error: (err) => {
          console.error('Failed to load user profile:', err);
        },
      });
  }

  /** Get token from localStorage */
  private getToken(): string {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user).token : '';
  }

  /** Formats phone number to E.164 */
  private formatPhone(phone: string): string {
    if (!phone) return '';
    return phone.startsWith('+') ? phone : `+91${phone}`; // Assuming India
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

  private extractPhoneString(phone: any): string {
    if (typeof phone === 'string') {
      return this.formatPhone(phone);
    }
    if (typeof phone === 'object' && phone.e164Number) {
      return phone.e164Number;
    }
    return '';
  }
}