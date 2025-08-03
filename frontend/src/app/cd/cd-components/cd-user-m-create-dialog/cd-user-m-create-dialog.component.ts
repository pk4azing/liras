import { Component, Inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  CountryISO,
  PhoneNumberFormat,
  SearchCountryField,
} from 'ngx-intl-tel-input';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from '@angular/material/dialog';
import { NgxIntlTelInputModule } from 'ngx-intl-tel-input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';
import { CdModeDirectiveDirective } from '../../cd-directives/cd-mode-directive/cd-mode-directive.directive';
import {
  UserManagementData,
  UserRole,
} from '../cd-user-management-table/cd-user-management-table.component';
import { CdCreateUserServiceService } from '../../cd-services/cd-create-user-service/cd-create-user-service.service';

@Component({
  selector: 'app-cd-user-m-create-dialog',
  imports: [
    NgxIntlTelInputModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    CommonModule,
    CdModeDirectiveDirective,
  ],
  templateUrl: './cd-user-m-create-dialog.component.html',
  styleUrl: './cd-user-m-create-dialog.component.scss',
})
export class CdUserMCreateDialogComponent implements OnInit {
  userForm: FormGroup;
  formChange = false;

  preferredCountries: CountryISO[] = [
    CountryISO.India,
    CountryISO.UnitedStates,
  ];
  CountryISO = CountryISO;
  PhoneNumberFormat = PhoneNumberFormat;
  SearchCountryField = SearchCountryField;
  cdRef: any;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CdUserMCreateDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private userService: CdCreateUserServiceService
  ) {
    this.userForm = this.fb.group({
      name: ['', Validators.required],
      email: [
        '',
        [
          Validators.required,
          Validators.email,
          Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$'),
        ],
      ],
      role: ['', Validators.required],
      phone: this.fb.control('', {
        validators: [Validators.required],
        updateOn: 'change',
      }),
      associatedClient: [''],
    });
  }

  ngOnInit(): void {
    this.userForm.get('role')?.valueChanges.subscribe((role) => {
      if (role !== 'sales') {
        this.userForm.get('associatedClient')?.setValue('');
      }
    });

    this.userForm.valueChanges.subscribe(() => {
      this.formChange = this.userForm.dirty;
    });
  }

  onSubmit(): void {
    if (this.userForm.valid) {
      const phoneValue = this.userForm.get('phone')?.value;

      const newUser: UserManagementData = {
        select: false,
        username: this.userForm.value.name,
        email: this.userForm.value.email,
        role: this.userForm.value.role,
        phone: phoneValue?.internationalNumber || '',
        status: 'Active',
        ...(this.userForm.value.role === UserRole.SALES && {
          associatedClient: this.userForm.value.associatedClient,
        }),
      };

      this.userService.addUser(newUser); // add to service
      this.dialogRef.close(); // optionally send newUser as result
    } else {
      this.markFormGroupTouched(this.userForm);
    }
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }

  private generateId(): string {
    return 'user_' + Math.random().toString(36).substr(2, 9);
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
    const phoneControl = this.userForm.get('phone');
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
