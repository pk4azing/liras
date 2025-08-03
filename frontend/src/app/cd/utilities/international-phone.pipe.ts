import { Pipe, PipeTransform } from '@angular/core';
import { PhoneNumberFormat, PhoneNumberUtil } from 'google-libphonenumber';

@Pipe({
  name: 'internationalPhone',
  standalone: true
})
export class InternationalPhonePipe implements PipeTransform {
  transform(phoneNumber: string): string {
    if (!phoneNumber) return '';
    
    try {
      const phoneUtil = PhoneNumberUtil.getInstance();
      const number = phoneUtil.parse(phoneNumber);
      return phoneUtil.format(number, PhoneNumberFormat.INTERNATIONAL);
    } catch (e) {
      return phoneNumber; // Return as-is if parsing fails
    }
  }
}