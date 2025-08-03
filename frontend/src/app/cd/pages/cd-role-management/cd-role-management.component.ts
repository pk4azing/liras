import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CdRolesTableComponent } from '../../cd-components/cd-roles-table/cd-roles-table.component';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { CdTitleServiceService } from '../../cd-services/cd-title-service/cd-title-service.service';
import { MatDialog } from '@angular/material/dialog';
import { CdRoleCreationDialogComponent } from '../../cd-components/cd-role-creation-dialog/cd-role-creation-dialog.component';

export interface CdRole {
  id: string;
  name: string;
  permissions: {
    feature1: boolean;
    feature2: boolean;
    feature3: boolean;
  };
}

@Component({
  selector: 'app-cd-role-management',
  imports: [CdRolesTableComponent, MatIconModule, FormsModule, ReactiveFormsModule, MatSnackBarModule, CommonModule],
  templateUrl: './cd-role-management.component.html',
  styleUrl: './cd-role-management.component.scss'
})
export class CdRoleManagementComponent {
  homeTitle: string = 'Home';
  isCreating: boolean = false;
  isCancelled: boolean = false;
  roleForm: FormGroup;
  @Output() roleCreated = new EventEmitter<CdRole>();
  @Output() roleCancelled = new EventEmitter<void>();

  constructor(private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private titleService: CdTitleServiceService,
    private dialog: MatDialog

  ) {
    this.roleForm = this.fb.group({
      name: ['', Validators.required],
      permissions: this.fb.group({
        feature1: [false],
        feature2: [false],
        feature3: [false],
      }),
    });
  }

  ngOnInit(): void {
    this.titleService.currentHomeTitle.subscribe(title => {
      this.homeTitle = title;
    });

  }

  get f() {
    return this.roleForm.controls;
  }

  get permissions() {
    return this.roleForm.get('permissions') as FormGroup;
  }

  onSubmit() {
    if (this.roleForm.valid) {
      const newRole: CdRole = this.roleForm.value;
      console.log('New Role:', newRole);
      this.snackBar.open('Role Created Successfully', 'Close', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
      });
      this.roleForm.reset();
      this.roleCreated.emit(newRole);
    } else {
      this.snackBar.open('Please fill in all required fields', 'Close', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
      });
    }
    this.isCancelled = false;
    this.isCreating = false;
  }

  resetForm() {
    console.log('clicked');
    this.roleForm.reset();
    this.roleCancelled = new EventEmitter<void>();
    this.isCancelled = true;
    this.isCreating = false;
  }

  onFeatureToggle(feature: 'feature1' | 'feature2' | 'feature3'): void {
    const currentValue = this.permissions.get(feature)?.value;
    this.permissions.get(feature)?.setValue(!currentValue);
    console.log(`${feature} toggled to:`, this.permissions.get(feature)?.value);
  }

  openCreateForm() {
    this.isCreating = true;
  }

  handleUserCreated() {
    this.isCreating = false;
  }

  handleCancel() {
    this.isCreating = false;
  }

  openCreateRoleDialog(): void {
    const dialogRef = this.dialog.open(CdRoleCreationDialogComponent, {
      width: 'max-content',
      panelClass: 'rounded-3',
      height: 'max-content',
    });

    dialogRef.afterClosed().subscribe((newRole: CdRole | null) => {
      if (newRole) {
        console.log('Role Created:', newRole);

        // Example: display a snackbar or push to list
        this.snackBar.open(`Role "${newRole.name}" created`, 'Close', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });

        // You can emit this role or add it to your list
        // Example: this.roles.push(newRole);
      } else {
        console.log('Role creation was cancelled or dialog closed without saving');
      }
    });
  }
}
