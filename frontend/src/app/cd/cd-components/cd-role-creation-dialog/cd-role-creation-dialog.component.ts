import { Component, EventEmitter, Inject, Output, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CdRole } from '../../pages/cd-role-management/cd-role-management.component';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { CdRoleManagementServiceService } from '../../cd-services/cd-role-management-service/cd-role-management-service.service';

@Component({
  selector: 'app-cd-role-creation-dialog',
  imports: [FormsModule, ReactiveFormsModule, MatIconModule, CommonModule],
  templateUrl: './cd-role-creation-dialog.component.html',
  styleUrl: './cd-role-creation-dialog.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class CdRoleCreationDialogComponent {
  roleForm: FormGroup;
  isCreating: boolean = false;
  isCancelled: boolean = false;
  @Output() roleCreated = new EventEmitter<CdRole>();
  @Output() roleCancelled = new EventEmitter<void>();


  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<CdRoleCreationDialogComponent>,
    private roleService: CdRoleManagementServiceService,
    @Inject(MAT_DIALOG_DATA) public data: any
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

  get f() {
    return this.roleForm.controls;
  }

  get permissions() {
    return this.roleForm.get('permissions') as FormGroup;
  }

  onFeatureToggle(feature: string) {
    const current = this.permissions.get(feature)?.value;
    this.permissions.get(feature)?.setValue(!current);
  }

  onSubmit(): void {
    if (this.roleForm.valid) {
      this.roleService.addRole(this.roleForm.value); // Service handles ID
      this.snackBar.open('Role Created Successfully', 'Close', { duration: 3000 });
      this.dialogRef.close();
    } else {
      this.snackBar.open('Please fill in all required fields', 'Close', { duration: 3000 });
    }
  }

  onCancel() {
    this.dialogRef.close(null);
    this.roleForm.reset();
  }

  resetForm() {
    console.log('clicked');
    this.roleForm.reset();
    this.roleCancelled = new EventEmitter<void>();
    this.isCancelled = true;
    this.isCreating = false;
  }



}
