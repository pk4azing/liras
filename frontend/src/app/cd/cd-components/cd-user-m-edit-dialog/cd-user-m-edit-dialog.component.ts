import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  CountryISO,
  NgxIntlTelInputModule,
  PhoneNumberFormat,
  SearchCountryField
} from 'ngx-intl-tel-input';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { CdModeDirectiveDirective } from '../../cd-directives/cd-mode-directive/cd-mode-directive.directive';
import { CdModeChangeServiceService } from '../../cd-services/cd-mode-change-service/cd-mode-change-service.service';




@Component({
  selector: 'app-cd-user-m-edit-dialog',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    NgxIntlTelInputModule,
    CdModeDirectiveDirective
  ]
  ,
  templateUrl: './cd-user-m-edit-dialog.component.html',
  styleUrl: './cd-user-m-edit-dialog.component.scss'
})
export class CdUserMEditDialogComponent {
  userForm: FormGroup;
  CountryISO = CountryISO;
  PhoneNumberFormat = PhoneNumberFormat;
  SearchCountryField = SearchCountryField;
  selectedCountryISO: CountryISO = CountryISO.India;

  constructor(
    public dialogRef: MatDialogRef<CdUserMEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private themeService: CdModeChangeServiceService,

  ) {
    this.userForm = this.fb.group({
      username: [{ value: '', disabled: true }],
      email: [
        '',
        [
          Validators.required,
          Validators.email,
          Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')
        ]
      ],
      status: ['', Validators.required],
      role: ['', Validators.required],
      phone: [undefined, Validators.required],
      associatedClient: ['']
    });

    this.patchForm(data);
  }

  patchForm(user: any) {
    const parsed = parsePhoneNumberFromString(user.phone);
    const phone = parsed && parsed.isValid()
      ? {
        number: parsed.nationalNumber,
        internationalNumber: parsed.formatInternational(),
        nationalNumber: parsed.formatNational(),
        countryCode: parsed.country,
        dialCode: '+' + parsed.countryCallingCode
      }
      : user.phone;

    this.userForm.patchValue({
      username: user.username,
      email: user.email,
      role: user.role,
      status: this.data.status?.toLowerCase() || '', phone: phone,
      associatedClient: user.associatedClient || ''
    });
  }

  onSave() {
    if (this.userForm.valid) {
      const updated = this.userForm.getRawValue();

      // Normalize phone to international format
      if (updated.phone?.internationalNumber) {
        updated.phone = updated.phone.internationalNumber;
      }

      // Capitalize status (e.g., "active" -> "Active")
      if (updated.status) {
        updated.status = updated.status.charAt(0).toUpperCase() + updated.status.slice(1).toLowerCase();
      }

      this.dialogRef.close(updated);
    } else {
      Object.values(this.userForm.controls).forEach((control) =>
        control.markAsTouched()
      );
    }
  }

  onCancel() {
    this.dialogRef.close();
  }



}
