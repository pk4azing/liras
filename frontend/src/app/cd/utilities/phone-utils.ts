import { PhoneNumberUtil, PhoneNumberFormat } from 'google-libphonenumber';

const phoneUtil = PhoneNumberUtil.getInstance();

export function parsePhoneNumber(phone: string) {
  try {
    const number = phoneUtil.parseAndKeepRawInput(phone);

    if (!number || !phoneUtil.isValidNumber(number)) {
      console.warn('Invalid phone number:', phone);
      return null;
    }

    const nationalNumber = number.getNationalNumber()?.toString() || '';
    const e164Number = phoneUtil.format(number, PhoneNumberFormat.E164);
    const internationalNumber = phoneUtil.format(number, PhoneNumberFormat.INTERNATIONAL);
    const countryCode = phoneUtil.getRegionCodeForNumber(number)?.toLowerCase() || '';
    const dialCode = `+${number.getCountryCode()}`;

    return {
      number: nationalNumber,
      internationalNumber,
      nationalNumber,
      e164Number,
      countryCode,
      dialCode,
    };
  } catch (error) {
    console.warn('Phone parse failed for:', phone, error);
    return null;
  }
}
