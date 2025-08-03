import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface UserProfile {
  name: string;
  phone: string;
  email: string;
  city: string;
  address: string;
}

@Injectable({
  providedIn: 'root'
})
export class CcdProfileDataServiceService {
  private userProfileSubject = new BehaviorSubject<UserProfile>(
    this.loadInitialProfile()
  );

  userProfile$ = this.userProfileSubject.asObservable();

  /** Load initial profile from localStorage or fallback to dummy */
  private loadInitialProfile(): UserProfile {
    const localUser = localStorage.getItem('user');

    if (localUser) {
      try {
        const user = JSON.parse(localUser);
        return {
          name: user.username || 'John Doe',
          phone: this.formatPhone(user.phone),
          email: user.email || 'john.doe@example.com',
          city: 'Hyderabad',
          address: 'Plot 45, Jubilee Hills',
        };
      } catch (e) {
        console.error('Invalid local user JSON', e);
      }
    }

    // Fallback dummy data
    return {
      name: 'John Doe',
      phone: '+11234567890',
      email: 'john.doe@example.com',
      city: 'Hyderabad',
      address: 'Plot 45, Jubilee Hills',
    };
  }

  /** Formats phone number to E.164 */
  private formatPhone(phone: string): string {
    if (!phone) return '';
    // Assume default US country code if not present
    return phone.startsWith('+') ? phone : `+1${phone}`;
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
    // If phone is a string, return it directly
    if (typeof phone === 'string') {
      return this.formatPhone(phone);
    }

    // If phone is an object from ngx-intl-tel-input, use e164Number
    if (typeof phone === 'object' && phone.e164Number) {
      return phone.e164Number;
    }

    // Fallback
    return '';
  }
}
