import { Component, Inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule, MatLabel } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import {
  CountryISO,
  PhoneNumberFormat,
  SearchCountryField,
} from 'ngx-intl-tel-input';
import { NgxIntlTelInputModule } from 'ngx-intl-tel-input';
import { CdModeDirectiveDirective } from '../../cd-directives/cd-mode-directive/cd-mode-directive.directive';
import { CdClientListServiceService, Client } from '../../cd-services/cd-client-list-service/cd-client-list-service.service';

@Component({
  selector: 'app-cd-create-client-dialog',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    CommonModule,
    NgxIntlTelInputModule,
    CdModeDirectiveDirective,
  ],
  templateUrl: './cd-create-client-dialog.component.html',
  styleUrl: './cd-create-client-dialog.component.scss',
})
export class CdCreateClientDialogComponent {
  userform!: FormGroup;
  formChange = false;
  cdRef: any;

  preferredCountries: CountryISO[] = [
    CountryISO.India,
    CountryISO.UnitedStates,
  ];
  CountryISO = CountryISO;
  PhoneNumberFormat = PhoneNumberFormat;
  SearchCountryField = SearchCountryField;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CdCreateClientDialogComponent>,
    private clientService: CdClientListServiceService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.userform = this.fb.group({
      clientName: ['', Validators.required],
      clientAddress: ['', Validators.required],
      clientEmail: [
        '',
        [
          Validators.required,
          Validators.email,
          Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$'),
        ],
      ],
      clientPhone: this.fb.control('', {
        validators: [Validators.required],
        updateOn: 'change',
      }),
      joinedDate: ['', Validators.required],
    });
  }

  onSubmit(): void {
    if (this.userform.valid) {
      const phoneValue = this.userform.get('clientPhone')?.value;
      const randomString = Math.random().toString(36).substring(2, 8);

      const newClient: Client = {
        id: 'LDC_C_A_' + Math.floor(Math.random() * 1000), // or UUID
        name: this.userform.value.clientName,
        email: this.userform.value.clientEmail,
        address: this.userform.value.clientAddress,
        phone: phoneValue?.internationalNumber || '',
        joinedDate: this.userform.value.joinedDate,
        domainName: `${randomString}.lf.com`,
        lastActivity: 0,
        filesUploaded: 0,
        startDate: new Date(), // Optional - adjust as needed
        expiryDate: new Date(
          new Date().setFullYear(new Date().getFullYear() + 1)
        ), // 1 year later
      };

      this.clientService.addClient(newClient); // ✅ Add to service

      this.dialogRef.close(newClient); // ✅ Return new client (optional if already in shared observable)
    } else {
      this.markFormGroupTouched(this.userform);
    }
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach((control) => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  onPhoneChange(): void {
    const phoneControl = this.userform.get('phone');
    if (phoneControl) {
      phoneControl.markAsDirty();
      phoneControl.updateValueAndValidity();
      this.formChange = true;
      this.cdRef.detectChanges();
    }
  }

  changePreferredCountries(): void {
    this.preferredCountries = [CountryISO.India, CountryISO.Canada];
  }
}
