import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

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

@Injectable({
  providedIn: 'root',
})
export class CdCreateUserServiceService {
  private initialUsers: UserManagementData[] = [
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

  private usersSubject = new BehaviorSubject<UserManagementData[]>(
    this.initialUsers
  );
  users$ = this.usersSubject.asObservable();

  getCurrentUsers(): UserManagementData[] {
    return this.usersSubject.getValue();
  }

  addUser(user: UserManagementData): void {
    const updatedUsers = [...this.getCurrentUsers(), user];
    this.usersSubject.next(updatedUsers);
  }
}
