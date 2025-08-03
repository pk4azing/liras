import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';


export interface CdRole {
  id: string;
  name: string;
  permissions: {
    feature1: boolean;
    feature2: boolean;
    feature3: boolean;
  };
}

@Injectable({
  providedIn: 'root'
})
export class CdRoleManagementServiceService {
    private initialRoles: CdRole[] = [
    {
      id: '1',
      name: 'Admin',
      permissions: { feature1: true, feature2: true, feature3: true },
    },
    {
      id: '2',
      name: 'Manager',
      permissions: { feature1: true, feature2: false, feature3: true },
    },
    {
      id: '3',
      name: 'Employee',
      permissions: { feature1: true, feature2: false, feature3: false },
    },
  ];

    private rolesSubject = new BehaviorSubject<CdRole[]>(this.initialRoles);
  roles$ = this.rolesSubject.asObservable();

  getCurrentRoles(): CdRole[] {
    return this.rolesSubject.getValue();
  }

  private getNextId(): string {
    const current = this.getCurrentRoles();
    const maxId = current.reduce((max, role) => {
      const numId = parseInt(role.id, 10);
      return numId > max ? numId : max;
    }, 0);
    return (maxId + 1).toString();
  }

  addRole(role: Omit<CdRole, 'id'>): void {
    const newRole: CdRole = {
      ...role,
      id: this.getNextId(),
    };
    this.rolesSubject.next([...this.getCurrentRoles(), newRole]);
  }

  updateRolePermission(roleId: string, feature: keyof CdRole['permissions'], value: boolean): void {
    const updated = this.getCurrentRoles().map(role =>
      role.id === roleId
        ? { ...role, permissions: { ...role.permissions, [feature]: value } }
        : role
    );
    this.rolesSubject.next(updated);
  }

  deleteRole(roleId: string): void {
    const updated = this.getCurrentRoles().filter(role => role.id !== roleId);
    this.rolesSubject.next(updated);
  }


}
