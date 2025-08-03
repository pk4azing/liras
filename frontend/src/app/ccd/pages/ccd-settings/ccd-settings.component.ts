import { CcdTitleServiceService } from '../../ccd-services/ccd-title-service/ccd-title-service.service';
import {
  MatError,
  MatFormField,
  MatFormFieldModule,
  MatLabel,
} from '@angular/material/form-field';
import { AfterViewInit, ChangeDetectorRef, Component, OnInit, signal } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { NgxIntlTelInputModule } from 'ngx-intl-tel-input';
import {
  CountryISO,
  PhoneNumberFormat,
  SearchCountryField,
} from 'ngx-intl-tel-input';
import { CcdModeDirective } from '../../ccd-directives/ccd-mode-directive/ccd-mode-directive.directive';
import { CcdModeChangeServiceService } from '../../ccd-services/ccd-mode-change-service/ccd-mode-change-service.service';
import { CcdProfileDataServiceService, UserProfile } from '../../ccd-services/ccd-profile-data-service/ccd-profile-data-service.service';



@Component({
  selector: 'app-ccd-settings',
  imports: [CommonModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatSnackBarModule,
    NgxIntlTelInputModule,
    CcdModeDirective
  ],
  templateUrl: './ccd-settings.component.html',
  styleUrls: ['./ccd-settings.component.scss',
    '../../../styles/style.min.css',
  ],
})
export class CcdSettingsComponent implements AfterViewInit, OnInit {
  homeTitle: string = 'Home';
  profileForm!: FormGroup;
  originalData!: UserProfile;

  hide = [signal(true), signal(true), signal(true)];
  passwordForm: FormGroup;
  oldPasswordValue = 'One';
  errorMessage = signal('');

  separateDialCode = true;
  SearchCountryField = SearchCountryField;
  CountryISO = CountryISO;
  PhoneNumberFormat = PhoneNumberFormat;

  preferredCountries: CountryISO[] = [
    CountryISO.UnitedStates,
    CountryISO.UnitedKingdom,
  ];

  formChange: boolean = false;

  constructor(
    private titleService: CcdTitleServiceService,
    private fb: FormBuilder,
    private _snackBar: MatSnackBar,
    private _router: Router,
    private cdRef: ChangeDetectorRef,
    // private themeService: CdModeChangeServiceService,
    private profileService: CcdProfileDataServiceService
  ) {
    this.passwordForm = this.fb.group(
      {
        oldPassword: ['', Validators.required],
        newPassword: ['', Validators.required],
        confirmPassword: ['', Validators.required],
      },
      { validators: this.passwordMatchValidator }
    );

    this.profileForm = this.fb.group({
      name: ['', Validators.required],
      phone: this.fb.control('', {
        validators: [Validators.required],
        updateOn: 'change',
      }),
      email: [
        '',
        [
          Validators.required,
          Validators.email,
          Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$'),
        ],
      ],
      city: ['', Validators.required],
      address: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.originalData = this.profileService.getUserProfile();
    const user = this.originalData;

    this.profileForm.patchValue({
      name: user.name,
      phone: user.phone,
      email: user.email,
      city: user.city,
      address: user.address,
    });

    this.titleService.currentHomeTitle.subscribe((title) => {
      this.homeTitle = title;
    });

    this.profileForm.markAsPristine();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.cdRef.detectChanges();
    }, 0);
  }

  changePreferredCountries() {
    this.preferredCountries = [CountryISO.India, CountryISO.Canada];
  }

  onSubmit(): void {
    if (this.profileForm.valid && this.profileForm.dirty) {
      const updatedForm = this.profileForm.value;

      // ✅ Convert ngx-intl-tel-input phone object to E.164 format
      const formattedPhone =
        typeof updatedForm.phone === 'string'
          ? updatedForm.phone
          : updatedForm.phone?.e164Number || '';

      const updatedData: UserProfile = {
        ...updatedForm,
        phone: formattedPhone,
      };

      // ✅ Track changed fields only
      const changes = this.getChangedFields(updatedData);
      console.log('Profile changes (for PATCH):', changes);

      // ✅ Update service with formatted data
      this.profileService.updateUserProfile(updatedData);

      // ✅ Store new data for future comparison
      this.originalData = { ...updatedData };

      this._snackBar.open('Profile updated successfully!', 'Close', {
        duration: 3000,
        verticalPosition: 'top',
      });

      this.profileForm.markAsPristine();
    } else if (this.profileForm.pristine) {
      this._snackBar.open('No changes detected', 'Close', {
        duration: 3000,
        verticalPosition: 'top',
      });
    }

    this.clearInput();
  }

  onInputChange() {
    this.formChange = true; // Set formChange to true when any input changes
  }

  clearInput() {
    this.formChange = false; // Set formChange to true when any input changes
  }

  onPhoneChange() {
    const phoneControl = this.profileForm.get('phone');

    if (phoneControl) {
      phoneControl.markAsDirty();
      phoneControl.updateValueAndValidity();
      this.formChange = true;
    }
  }

  private getChangedFields(updatedData: UserProfile): any {
    const changes: any = {};
    Object.keys(updatedData).forEach((key) => {
      if (
        updatedData[key as keyof UserProfile] !==
        this.originalData[key as keyof UserProfile]
      ) {
        changes[key] = {
          oldValue: this.originalData[key as keyof UserProfile],
          newValue: updatedData[key as keyof UserProfile],
        };
      }
    });
    return changes;
  }

  onCancel(): void {
    this.profileForm.reset(this.originalData);
    this.cdRef.detectChanges();
    this.profileForm.markAsPristine();
    this.clearInput();
  }

  get f() {
    return this.profileForm.controls;
  }

  passwordMatchValidator(formGroup: FormGroup) {
    const newPassword = formGroup.get('newPassword')?.value;
    const confirmPassword = formGroup.get('confirmPassword')?.value;

    if (newPassword !== confirmPassword) {
      formGroup.get('confirmPassword')?.setErrors({ passwordMismatch: true });
    } else {
      formGroup.get('confirmPassword')?.setErrors(null);
    }
  }

  clickEvent(index: number, event: MouseEvent) {
    this.hide[index].set(!this.hide[index]());
    event.stopPropagation();
  }

  changePassword() {
    this.errorMessage.set('');
    if (this.passwordForm.invalid) {
      return;
    }

    const oldPassword = this.passwordForm.get('oldPassword')?.value;
    const newPassword = this.passwordForm.get('newPassword')?.value;
    const confirmPassword = this.passwordForm.get('confirmPassword')?.value;

    if (oldPassword !== this.oldPasswordValue) {
      this.errorMessage.set('Wrong password entered');
      return;
    }

    console.log('New Password:', newPassword);

    this._snackBar.open(
      'Password changed successfully, Redirecting to Homepage',
      'Close',
      {
        duration: 3000, // Duration in milliseconds
        horizontalPosition: 'center', // Position of the snackbar
        verticalPosition: 'top',
      }
    );

    setTimeout(() => {
      this._router.navigate(['/cd-home']);
    }, 1000); // Wait 1 second before redirecting (adjust as needed)
  }
}
