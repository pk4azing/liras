import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Client {
  id: string;
  name: string;
  startDate: Date;
  lastActivity: number;
  filesUploaded: number;
  expiryDate: Date;
  email: string;
  address: string;
  phone: string;
  joinedDate: Date;
  domainName: string;
}

@Injectable({
  providedIn: 'root',
})
export class CdClientListServiceService {
  private clientsSubject = new BehaviorSubject<Client[]>([
    {
      id: 'LDC_C_A_W3',
      name: 'Company A LLC',
      email: 'info@companyA.com',
      address: '123 Main St, New York, NY 10001',
      phone: '+49 1512 3456789',
      joinedDate: new Date('2023-01-15'),
      startDate: new Date('2024-03-10'),
      lastActivity: 2,
      filesUploaded: 15,
      expiryDate: new Date('2025-03-10'),
      domainName: 'lucid.companyA.com',
    },
    {
      id: 'LDC_C_A_W12',
      name: 'Company B INC.',
      email: 'jane.smith@companyB.com',
      address: '456 Park Ave, Los Angeles, CA 90012',
      phone: '+1-234-567-8901',
      joinedDate: new Date('2023-03-22'),
      startDate: new Date('2024-06-22'),
      lastActivity: 1,
      filesUploaded: 8,
      expiryDate: new Date('2025-06-22'),
      domainName: 'lucid.companyB.com',
    },
    {
      id: 'LDC_C_A_W23',
      name: 'Company C Ltd.',
      email: 'bob.johnson@email.com',
      address: '789 Oak Rd, Chicago, IL 60601',
      phone: '+1-234-567-8902',
      joinedDate: new Date('2023-06-05'),
      startDate: new Date('2024-01-05'),
      lastActivity: 3,
      filesUploaded: 12,
      expiryDate: new Date('2025-01-05'),
      domainName: 'lucid.bobjohnson.com',
    },
    {
      id: 'LDC_C_A_W46',
      name: 'Company D Corp.',
      email: 'sri.ram@email.com',
      address: '654 Maple Dr, Boston, MA 02108',
      phone: '+1-234-567-8903',
      joinedDate: new Date('2023-11-12'),
      startDate: new Date('2024-02-28'),
      lastActivity: 1,
      filesUploaded: 19,
      expiryDate: new Date('2025-02-28'),
      domainName: 'lucid.sriram.com',
    },
    {
      id: 'LDC_C_A_W35',
      name: 'Company E Group',
      email: 'aravind.swamy@email.com',
      address: '321 Pine St, Seattle, WA 98101',
      phone: '+1-234-567-8904',
      joinedDate: new Date('2023-08-30'),
      startDate: new Date('2024-05-18'),
      lastActivity: 2,
      filesUploaded: 5,
      expiryDate: new Date('2025-05-18'),
      domainName: 'lucid.swamy.com',
    },
  ]);

  clients$ = this.clientsSubject.asObservable();
  getClients(): Client[] {
    return this.clientsSubject.value;
  }

  updateClient(updatedClient: Partial<Client> & { id: string }) {
    const updatedClients = this.getClients().map((client) =>
      client.id === updatedClient.id ? { ...client, ...updatedClient } : client
    );
    this.clientsSubject.next(updatedClients);
  }

  addClient(newClient: Client) {
    const updated = [...this.getClients(), newClient];
    this.clientsSubject.next(updated);
  }
}
