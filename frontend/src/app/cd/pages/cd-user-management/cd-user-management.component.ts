import { Component, OnInit, ViewChild } from '@angular/core';
import { CdTitleServiceService } from '../../cd-services/cd-title-service/cd-title-service.service';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgxIntlTelInputModule } from 'ngx-intl-tel-input';
import {
  CountryISO,
  PhoneNumberFormat,
  SearchCountryField,
} from 'ngx-intl-tel-input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CdModeDirectiveDirective } from '../../cd-directives/cd-mode-directive/cd-mode-directive.directive';
import { CdUserManagementTableComponent } from '../../cd-components/cd-user-management-table/cd-user-management-table.component';
import { CdUserMCreateDialogComponent } from '../../cd-components/cd-user-m-create-dialog/cd-user-m-create-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { CdModeChangeServiceService } from '../../cd-services/cd-mode-change-service/cd-mode-change-service.service';

// export interface CdUserM {
//   id: string;
//   name: string;
//   email: string;
//   role: 'Admin' | 'Manager' | 'Employee';
//   phone: string;
//   password?: string;
//   associatedClient?: string;
// }

@Component({
  selector: 'app-cd-user-management',
  imports: [
    CommonModule,
    NgxIntlTelInputModule,
    ReactiveFormsModule,
    MatSnackBarModule,
    CdUserManagementTableComponent,
    CdModeDirectiveDirective,
  ],
  templateUrl: './cd-user-management.component.html',
  styleUrl: './cd-user-management.component.scss',
})
export class CdUserManagementComponent implements OnInit {
  homeTitle: string = 'Home';
  separateDialCode = true;
  SearchCountryField = SearchCountryField;
  CountryISO = CountryISO;
  PhoneNumberFormat = PhoneNumberFormat;

  preferredCountries: CountryISO[] = [
    CountryISO.UnitedStates,
    CountryISO.UnitedKingdom,
  ];

  cdRef: any;

  constructor(
    private fb: FormBuilder,
    private titleService: CdTitleServiceService,
    private dialog: MatDialog,
    private themeService: CdModeChangeServiceService
  ) {}

  ngOnInit(): void {
    this.titleService.currentHomeTitle.subscribe((title) => {
      this.homeTitle = title;
    });
  }

  onCreateClick(): void {
    const dialogRef = this.dialog.open(CdUserMCreateDialogComponent, {
      width: '600px', // adjust as needed
      panelClass: 'someclass',
      data: {}, // optional, pass initial data if needed
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        console.log('Form submitted:', result);
        // Handle submitted form data (e.g., push to a list or send to backend)
      } else {
        console.log('Form was cancelled.');
      }
    });
  }
}
