import { LiveAnnouncer } from '@angular/cdk/a11y';
import {
  Component,
  EventEmitter,
  inject,
  OnInit,
  Output,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import {
  MatTable,
  MatTableDataSource,
  MatTableModule,
} from '@angular/material/table';
import {
  CountryISO,
  NgxIntlTelInputModule,
  PhoneNumberFormat,
  SearchCountryField,
} from 'ngx-intl-tel-input';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { parsePhoneNumber } from '../../utilities/phone-utils';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CdModeDirectiveDirective } from '../../cd-directives/cd-mode-directive/cd-mode-directive.directive';
import { CdUserMEditDialogComponent } from '../cd-user-m-edit-dialog/cd-user-m-edit-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { CdCreateUserServiceService } from '../../cd-services/cd-create-user-service/cd-create-user-service.service';

export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  USER = 'user',
  SALES = 'sales',
}

export interface UserManagementData {
  select: boolean;
  username: string;
  email: string;
  role: UserRole;
  phone: string;
  associatedClient?: string;
  status: string;
}

const ELEMENT_DATA: UserManagementData[] = [
  {
    select: false,
    username: 'JohnDoe',
    email: 'john.doe@example.com',
    role: UserRole.SALES,
    phone: '+44 20 7946 0958', // UK
    associatedClient: 'Client A',
    status: 'Active',
  },
  {
    select: false,
    username: 'JaneSmith',
    email: 'jane.smith@example.com',
    role: UserRole.SALES,
    phone: '+91 98765 43210', // India
    associatedClient: 'Client B',
    status: 'Inactive',
  },
  {
    select: false,
    username: 'AliceJohnson',
    email: 'alice.johnson@example.com',
    role: UserRole.USER,
    phone: '+61 412 345 678', // Australia
    status: 'Active',
  },
  {
    select: false,
    username: 'Bob Williams',
    email: 'bob.williams@example.com',
    role: UserRole.SALES,
    phone: '+49 1512 3456789', // Germany
    associatedClient: 'Client A',
    status: 'Inactive',
  },
  {
    select: false,
    username: 'Eve Brown',
    email: 'eve.brown@example.com',
    role: UserRole.ADMIN,
    phone: '+33 6 12 34 56 78', // France
    status: 'Active',
  },
];

@Component({
  selector: 'app-cd-user-management-table',
  imports: [
    MatButtonModule,
    MatSortModule,
    MatOptionModule,
    MatCheckboxModule,
    FormsModule,
    MatIconModule,
    MatPaginator,
    MatTableModule,
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    NgxIntlTelInputModule,
    CdModeDirectiveDirective,
  ],
  templateUrl: './cd-user-management-table.component.html',
  styleUrl: './cd-user-management-table.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class CdUserManagementTableComponent implements OnInit {
  private _liveAnnouncer = inject(LiveAnnouncer);
  displayedColumns: string[] = [
    // 'select',
    'username',
    'email',
    'status',
    'role',
    'phone',
    'associatedClient',
    'action',
  ];
  userForm: FormGroup;
  searchTerm: string = '';

  dataSource = new MatTableDataSource<UserManagementData>();
  pageSizeOptions: number[] = [5, 10, 15];
  pageSize: number = 5;
  editingForm = false;
  @Output() editUser = new EventEmitter<string>();
  @Output() selectionChange = new EventEmitter<number>();
  @Output() emptyStateChange = new EventEmitter<boolean>();
  selectedItems: any[] = [];
  selectedUserUsername: string | null = null;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  @Output() singleSelectedUsername = new EventEmitter<string | null>();

  CountryISO = CountryISO;
  SearchCountryField = SearchCountryField;
  PhoneNumberFormat = PhoneNumberFormat;
  selectedCountryISO: CountryISO = CountryISO.UnitedStates;

  constructor(
    private snackBar: MatSnackBar,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private http: HttpClient,
    private userService: CdCreateUserServiceService
  ) {
    this.userForm = this.fb.group({
      username: [{ value: '', disabled: true }],
      email: [
        '',
        [
          Validators.required,
          Validators.email,
          Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$'),
        ],
      ],
      status: ['', Validators.required],
      role: ['', Validators.required],
      phone: [undefined, [Validators.required]],
      associatedClient: [''],
    });
  }

  ngOnInit(): void {
        this.userService.users$.subscribe(users => {
      this.dataSource.data = users;
    });
  }
  

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  // Clear search
  clearSearch(event: Event): void {
    event.preventDefault(); // Prevent form submit
    this.searchTerm = '';
    this.dataSource.filter = '';
  }

  private checkEmptyState(): void {
    const isEmpty = this.dataSource.data.length === 0;
    this.emptyStateChange.emit(isEmpty);
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  patchForm(user: UserManagementData) {
    const parsedPhone = parsePhoneNumber(user.phone);

    this.userForm.patchValue({
      username: user.username,
      email: user.email,
      role: user.role,
      associatedClient: user.associatedClient || '',
      phone: parsedPhone,
    });
  }

  announceSortChange(sortState: Sort) {
    if (sortState.direction) {
      this._liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
    } else {
      this._liveAnnouncer.announce('Sorting cleared');
    }
  }

  onPageSizeChange(event: any) {
    this.pageSize = event.value;
    this.dataSource.paginator?.firstPage();
  }

  selectAll(event: any) {
    const checked = event.checked;
    this.dataSource.data.forEach((row) => (row.select = checked));
    this.updateSelectionCount();
  }

  onCheckBoxChange(): void {
    this.updateSelectionCount();
  } // private updateSelectionCount(): void { //   // 1. Get selected items //   this.selectedItems = this.dataSource.data.filter((item) => item.select); //   // 2. Update single selected username //   this.selectedUserUsername = this.selectedItems.length === 1 //     ? this.selectedItems[0].username //     : null; //   // 3. Emit all necessary events //   this.selectionChange.emit(this.selectedItems.length); // Existing emission //   this.singleSelectedUsername.emit(this.selectedUserUsername); // New emission //   this.checkEmptyState(); // Existing check // }

  private updateSelectionCount(): void {
    // 1. Get selected items
    this.selectedItems = this.dataSource.data.filter((item) => item.select); // 2. Update single selected username

    this.selectedUserUsername =
      this.selectedItems.length === 1 ? this.selectedItems[0].username : null; // 3. Log the selected username

    if (this.selectedUserUsername) {
      console.log(`Selected user: ${this.selectedUserUsername}`);
    } else {
      console.log(
        `No single user selected. Total selected: ${this.selectedItems.length}`
      );
    } // 4. Emit all necessary events

    this.selectionChange.emit(this.selectedItems.length); // Existing emission
    this.singleSelectedUsername.emit(this.selectedUserUsername); // New emission
    this.checkEmptyState(); // Existing check
  }

  onSave() {
    if (this.userForm.valid && this.selectedUserUsername) {
      const updatedFormValues = this.userForm.getRawValue();

      if (
        updatedFormValues.phone &&
        typeof updatedFormValues.phone === 'object'
      ) {
        updatedFormValues.phone = updatedFormValues.phone.internationalNumber;
      }

      const index = this.dataSource.data.findIndex(
        (u) => u.username === this.selectedUserUsername
      );

      if (index !== -1) {
        const originalUser = this.dataSource.data[index];
        const changedFields: string[] = [];
        const patchPayload: any = {};

        ['email', 'status', 'role', 'phone', 'associatedClient'].forEach(
          (key) => {
            const oldValue = originalUser[key as keyof UserManagementData];
            const newValue = updatedFormValues[key as keyof UserManagementData];

            if (oldValue !== newValue) {
              changedFields.push(key);
              patchPayload[key] = newValue;
              console.log(`- ${key}: "${oldValue}" ➝ "${newValue}"`);
            }
          }
        );

        if (changedFields.length === 0) {
          console.log('No changes detected, skipping save.');
          this.editingForm = false;
          this.selectedUserUsername = null;
          this.userForm.reset();
          return;
        }

        // ✅ Simulate PATCH request log
        console.log(`\nPATCH /api/users/${this.selectedUserUsername}/`);
        console.log('Payload:', patchPayload);
        console.log(
          `Updated the fields: ${changedFields.join(', ')} for username: ${
            this.selectedUserUsername
          }\n`
        );

        // Update local data source manually
        this.dataSource.data[index] = {
          ...originalUser,
          ...patchPayload,
          select: false,
        };
        this.dataSource.data = [...this.dataSource.data];

        this.snackBar.open('Successfully updated user details', 'Close', {
          duration: 3000,
          verticalPosition: 'top',
          horizontalPosition: 'center',
        });

        this.editingForm = false;
        this.selectedUserUsername = null;
        this.userForm.reset();
      } else {
        console.log('User not found in dataSource');
      }
    } else {
      if (!this.userForm.valid) {
        console.log('Form submission failed - invalid data');
        Object.keys(this.userForm.controls).forEach((key) => {
          const control = this.userForm.get(key);
          if (control?.errors) {
            console.log(`Field "${key}" has errors:`, control.errors);
          }
        });
      }
      if (!this.selectedUserUsername) {
        console.log(
          'No user selected (selectedUserUsername is null/undefined)'
        );
      }
    }
  }

  onCancel() {
    this.editingForm = false;
    this.selectedUserUsername = null;
    this.userForm.reset();
  }

  get f() {
    return this.userForm.controls;
  }

  onDeleteUser(userId: string): void {
    const isConfirmed = confirm('Are you sure you want to delete this user?');

    if (isConfirmed) {
      // ✅ Simulate Django-style DELETE request log
      console.log(`Attempting to delete the user with id: ${userId}`);
      console.log(`DELETE request to /api/users/${userId}/`);

      // Simulate frontend removal
      this.dataSource.data = this.dataSource.data.filter(
        (user) => user.username !== userId
      );
      this.dataSource._updateChangeSubscription();
      this.checkEmptyState();

      this.snackBar.open('Successfully deleted selected user', 'Close', {
        duration: 3000,
        verticalPosition: 'top',
        horizontalPosition: 'center',
      });
    }
  }

  // onEditClick(username: string) {
  //   this.selectedUserUsername = username;
  //   const user = this.dataSource.data.find((u) => u.username === username);

  //   if (user) {
  //     // Parse the phone string using libphonenumber-js
  //     const parsed = parsePhoneNumberFromString(user.phone);
  //     if (parsed && parsed.isValid()) {
  //       // Set the selected country for the dropdown
  //       this.selectedCountryISO = parsed.country as CountryISO;

  //       // Patch the phone field with the proper format expected by ngx-intl-tel-input
  //       this.userForm.patchValue({
  //         username: user.username,
  //         email: user.email,
  //         status: user.status,
  //         role: user.role,
  //         phone: {
  //           number: parsed.nationalNumber, // Only the national number part
  //           internationalNumber: parsed.formatInternational(),
  //           nationalNumber: parsed.formatNational(),
  //           countryCode: parsed.country,
  //           dialCode: '+' + parsed.countryCallingCode,
  //         },
  //         associatedClient: user.associatedClient || '',
  //       });
  //     } else {
  //       console.warn('Invalid phone number format:', user.phone);
  //       // Fallback to raw value if parsing fails
  //       this.userForm.patchValue({
  //         username: user.username,
  //         email: user.email,
  //         status: user.status,
  //         role: user.role,
  //         phone: user.phone,
  //         associatedClient: user.associatedClient || '',
  //       });
  //     }

  //     this.editingForm = true;
  //   }
  //   window.scrollTo({ top: 0, behavior: 'smooth' });
  // }

  onEditClick(username: string): void {
    const user = this.dataSource.data.find((u) => u.username === username);
    if (!user) return;

    const dialogRef = this.dialog.open(CdUserMEditDialogComponent, {
      width: '700px',
      panelClass: ['custom-dialog-container', 'rounded-3'],
      data: user,
    });

    dialogRef
      .afterClosed()
      .subscribe((result: UserManagementData | undefined) => {
        if (result) {
          const index = this.dataSource.data.findIndex(
            (u) => u.username === result.username
          );
          if (index !== -1) {
            // Update data in table
            this.dataSource.data[index] = {
              ...this.dataSource.data[index],
              ...result,
              select: false,
            };
            this.dataSource.data = [...this.dataSource.data];

            console.log('User data updated:', result);
          }
        }
      });
  }
}
