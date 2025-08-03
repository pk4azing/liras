import { Component, OnInit } from '@angular/core';
import { CdRole } from '../../pages/cd-role-management/cd-role-management.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import {
  MatSlideToggle,
  MatSlideToggleModule,
} from '@angular/material/slide-toggle';
import { MatTableModule } from '@angular/material/table';
import { CdModeDirectiveDirective } from '../../cd-directives/cd-mode-directive/cd-mode-directive.directive';
import { CdRoleManagementServiceService } from '../../cd-services/cd-role-management-service/cd-role-management-service.service';

@Component({
  selector: 'app-cd-roles-table',
  imports: [
    MatTableModule,
    MatSlideToggleModule,
    MatIconModule,
    MatButtonModule,
    CommonModule,
    CdModeDirectiveDirective,
  ],
  templateUrl: './cd-roles-table.component.html',
  styleUrl: './cd-roles-table.component.scss',
})
export class CdRolesTableComponent implements OnInit {
  roles: CdRole[] = [
    // {
    //   id: '1',
    //   name: 'Admin',
    //   permissions: {
    //     feature1: true,
    //     feature2: true,
    //     feature3: true,
    //   },
    // },
    // {
    //   id: '2',
    //   name: 'Manager',
    //   permissions: {
    //     feature1: true,
    //     feature2: false,
    //     feature3: true,
    //   },
    // },
    // {
    //   id: '3',
    //   name: 'Employee',
    //   permissions: {
    //     feature1: true,
    //     feature2: true,
    //     feature3: false,
    //   },
    // },
  ];

  displayedColumns: string[] = [
    'name',
    'feature1',
    'feature2',
    'feature3',
    'actions',
  ];
  toggleStates: { [roleId: string]: { [feature: string]: boolean } } = {};

  constructor(
    private snackBar: MatSnackBar,
    private roleService: CdRoleManagementServiceService
  ) {
    // console.log('Initial roles:', this.roles);
    this.roles.forEach((role) => {
      this.toggleStates[role.id] = {
        feature: role.permissions.feature1,
        feature2: role.permissions.feature2,
        feature3: role.permissions.feature3,
      };
    });
  }

  ngOnInit(): void {
    this.roleService.roles$.subscribe((roles) => {
      this.roles = roles;
    });
  }

  onDeleteRole(roleId: string): void {
    const isConfirmed = confirm('Are you sure you want to delete this role?');

    if (isConfirmed) {
      console.log(`Attempting to delete role with ID: ${roleId}`);

      // ✅ Use RoleService to delete
      this.roleService.deleteRole(roleId);

      this.snackBar.open('Successfully deleted selected role', 'Close', {
        duration: 3000,
        verticalPosition: 'top',
        horizontalPosition: 'center',
      });
    }
  }

  onFeatureToggle(
    isChecked: boolean,
    roleId: string,
    feature: 'feature1' | 'feature2' | 'feature3'
  ): void {
    const role = this.roles.find((r) => r.id === roleId);
    if (!role) return;

    const currentState = role.permissions[feature];
    const featureName = this.getFeatureName(feature);

    const confirmation = confirm(
      `Do you want to turn ${currentState ? 'OFF' : 'ON'} ${featureName} for ${
        role.name
      }?`
    );

    if (!confirmation) {
      // Revert the checkbox state visually
      if (!this.toggleStates[roleId]) {
        this.toggleStates[roleId] = {
          feature1: role.permissions.feature1,
          feature2: role.permissions.feature2,
          feature3: role.permissions.feature3,
        };
      }
      this.toggleStates[roleId][feature] = currentState;
      return;
    }

    // Update toggle state map
    if (!this.toggleStates[roleId]) {
      this.toggleStates[roleId] = {
        feature1: role.permissions.feature1,
        feature2: role.permissions.feature2,
        feature3: role.permissions.feature3,
      };
    }

    this.toggleStates[roleId][feature] = isChecked;

    // ✅ Update using RoleService
    this.roleService.updateRolePermission(roleId, feature, isChecked);

    // Simulated PATCH log
    const patchPayload = {
      permissions: {
        [feature]: isChecked,
      },
    };
    console.log(`PATCH /roles/${roleId}`, patchPayload);

    this.snackBar.open(
      `${featureName} ${isChecked ? 'enabled' : 'disabled'} for ${role.name}`,
      'Close',
      {
        duration: 3000,
        verticalPosition: 'top',
        horizontalPosition: 'center',
      }
    );
  }

  // Helper method to get feature display names
  private getFeatureName(feature: string): string {
    const featureNames: { [key: string]: string } = {
      feature1: 'User Management',
      feature2: 'Client Management',
      feature3: 'Role Management',
    };
    return featureNames[feature] || feature;
  }
}
