import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface CdTickets {
  ticket_id: string;
  created_by: string;
  cdassigned_to?: string;
  created_date: string;
  status: CdTicketStatus;
  priority: CdTicketPriority;
  description: string;
  resolution_note: string;
}

export enum CdTicketStatus {
  OPEN = 'Open',
  IN_PROGRESS = 'In Progress',
  CLOSED = 'Closed',
  RESOLVED = 'Resolved',
}

export enum CdTicketPriority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  CRITICAL = 'Critical',
}

@Injectable({
  providedIn: 'root',
})
export class CdTicketsServiceService {
  private tickets: CdTickets[] = [
    {
      ticket_id: 'CD-TKT-001',
      created_by: 'Thomas Johnson',
      cdassigned_to: 'Support Team A',
      created_date: '2024-07-15',
      status: CdTicketStatus.OPEN,
      priority: CdTicketPriority.HIGH,
      description: 'Issue with login functionality.',
      resolution_note: '',
    },
    {
      ticket_id: 'CD-TKT-002',
      created_by: 'Sarah Davis',
      cdassigned_to: 'Dev Team B',
      created_date: '2024-07-14',
      status: CdTicketStatus.IN_PROGRESS,
      priority: CdTicketPriority.MEDIUM,
      description: 'Request for a new feature.',
      resolution_note: '',
    },
    {
      ticket_id: 'CD-TKT-003',
      created_by: 'Robert Taylor',
      cdassigned_to: 'Support Team A',
      created_date: '2024-07-13',
      status: CdTicketStatus.RESOLVED,
      priority: CdTicketPriority.LOW,
      description: 'Minor UI issue on the profile page.',
      resolution_note: 'Provided link to internal wiki page.',
    },
    {
      ticket_id: 'CD-TKT-004',
      created_by: 'Patricia Garcia',
      cdassigned_to: 'Dev Team A',
      created_date: '2024-07-12',
      status: CdTicketStatus.CLOSED,
      priority: CdTicketPriority.CRITICAL,
      description: 'Problem with report generation.',
      resolution_note: 'Hotfix applied and rollback procedure updated.',
    },
    {
      ticket_id: 'CD-TKT-005',
      created_by: 'Michael Brown',
      cdassigned_to: 'Support Team B',
      created_date: '2024-07-11',
      status: CdTicketStatus.OPEN,
      priority: CdTicketPriority.MEDIUM,
      description: 'Slow performance when viewing deployment history.',
      resolution_note: '',
    },
    {
      ticket_id: 'CD-TKT-006',
      created_by: 'Thomas Johnson',
      cdassigned_to: 'Dev Team B',
      created_date: '2024-07-10',
      status: CdTicketStatus.IN_PROGRESS,
      priority: CdTicketPriority.LOW,
      description: 'Inquiry about API documentation.',
      resolution_note: '',
    },
    {
      ticket_id: 'CD-TKT-007',
      created_by: 'Sarah Davis',
      cdassigned_to: 'Support Team A',
      created_date: '2024-07-09',
      status: CdTicketStatus.RESOLVED,
      priority: CdTicketPriority.HIGH,
      description: 'Issue with email notifications.',
      resolution_note: 'Configuration updated and verified.',
    },
  ];

  private ticketsSubject = new BehaviorSubject<CdTickets[]>(this.tickets);
  tickets$ = this.ticketsSubject.asObservable();

  getCurrentTickets(): CdTickets[] {
    return this.ticketsSubject.getValue();
  }

  private generateTicketId(): string {
    const current = this.getCurrentTickets();
    const ids = current.map((t) => t.ticket_id);
    const lastNum = ids.reduce((max, id) => {
      const match = id.match(/CD-TKT-(\d+)/);
      const num = match ? +match[1] : 0;
      return num > max ? num : max;
    }, 0);
    const next = lastNum + 1;
    return `CD-TKT-${next.toString().padStart(3, '0')}`;
  }

  addTicket(ticket: Omit<CdTickets, 'ticket_id'>): void {
    const newTicket: CdTickets = {
      ...ticket,
      ticket_id: this.generateTicketId(),
    };
    const updated = [...this.getCurrentTickets(), newTicket];
    this.ticketsSubject.next(updated);
  }
}
