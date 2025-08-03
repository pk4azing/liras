import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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

interface CdViewTicketDetails extends CdTickets {
  title: string;
  detailedDescription: string;
  activities?: Activity[];
}

export interface Activity {
  type: 'created' | 'assigned' | 'status' | 'severity' | 'assignee' | 'comment';

  user: string;
  timestamp: string;
  field?: string;
  fromValue?: string;
  toValue?: string;
  comment?: string;
}

@Injectable({
  providedIn: 'root',
})
export class CdViewTicketServiceService {
  // private apiUrl = 'https://your-api-url.com/api/tickets';
  private ticketStore: CdViewTicketDetails[] = [
    {
      ticket_id: 'CD-TKT-001',
      created_by: 'User A',
      cdassigned_to: 'Support Agent 1',
      created_date: '2025-04-01',
      status: CdTicketStatus.OPEN,
      priority: CdTicketPriority.HIGH,
      description: 'Issue with login functionality.',
      resolution_note: '',
      title: 'Login Error',
      detailedDescription:
        'Users are unable to log in to the application. This is a critical issue affecting all users.',
      activities: [
        {
          type: 'status',
          user: 'Kiran',
          timestamp: 'February 28, 2024 at 3:07 PM',
          field: 'Status',
          fromValue: 'In Progress',
          toValue: 'Resolved',
        },
        {
          type: 'assignee',
          user: 'Random User',
          timestamp: 'February 27, 2024 at 3:07 PM',
          field: 'Assignee',
          fromValue: 'Random User',
          toValue: 'Kiran',
          comment: 'Assigning to you Lorem, ipsum dolor sit amet...',
        },
        {
          type: 'severity',
          user: 'Prasanna Kumar Tatiparthi',
          timestamp: 'February 25, 2024 at 3:07 PM',
          field: 'Severity',
          fromValue: 'Medium',
          toValue: 'High',
        },
        {
          type: 'severity',
          user: 'Prasanna Kumar Tatiparthi',
          timestamp: 'February 26, 2024 at 3:07 PM',
          field: 'Severity',
          fromValue: 'Medium',
          toValue: 'High',
        },
        {
          type: 'assigned',
          user: 'Prasanna Kumar Tatiparthi',
          timestamp: 'February 23, 2024 at 3:07 PM',
          field: 'Issue',
        },
        {
          type: 'created',
          user: 'Akhil',
          timestamp: 'February 22, 2024 at 3:07 PM',
          field: 'Issue',
        },
        {
          type: 'comment',
          user: 'SON',
          timestamp: 'February 29, 2024 at 10:00 AM',
          comment: 'This is a comment added by SON.',
        },
      ],
    },
    {
      ticket_id: 'CD-TKT-002',
      created_by: 'User B',
      cdassigned_to: 'Support Agent 2',
      created_date: '2025-04-02',
      status: CdTicketStatus.IN_PROGRESS,
      priority: CdTicketPriority.MEDIUM,
      description: 'Request for a new feature.',
      resolution_note: 'Currently being analyzed.',
      title: 'New Feature Request: Dashboard Customization',
      detailedDescription:
        'User B has requested the ability to customize their dashboard with different widgets and layouts.',
    },
    {
      ticket_id: 'CD-TKT-003',
      created_by: 'User C',
      cdassigned_to: 'Support Agent 1',
      created_date: '2025-04-03',
      status: CdTicketStatus.RESOLVED,
      priority: CdTicketPriority.LOW,
      description: 'Minor UI issue on the profile page.',
      resolution_note: 'Issue resolved by updating the CSS.',
      title: 'Profile Page UI Alignment',
      detailedDescription:
        'There is a slight alignment issue with the user profile information displayed on the profile page.',
    },
    {
      ticket_id: 'CD-TKT-004',
      created_by: 'User D',
      cdassigned_to: 'Support Agent 3',
      created_date: '2025-04-04',
      status: CdTicketStatus.CLOSED,
      priority: CdTicketPriority.MEDIUM,
      description: 'Problem with report generation.',
      resolution_note:
        'Root cause identified and fixed. Report generation is now working.',
      title: 'Report Generation Failure',
      detailedDescription:
        'Users were unable to generate specific reports. The underlying issue has been resolved.',
    },
    {
      ticket_id: 'CD-TKT-005',
      created_by: 'User E',
      cdassigned_to: 'Support Agent 2',
      created_date: '2025-04-05',
      status: CdTicketStatus.OPEN,
      priority: CdTicketPriority.HIGH,
      description: 'Slow performance when viewing deployment history.',
      resolution_note: '',
      title: 'Performance Degradation',
      detailedDescription:
        'The system is experiencing significant performance slowdowns, impacting user productivity.',
    },
    {
      ticket_id: 'CD-TKT-006',
      created_by: 'User F',
      cdassigned_to: 'Support Agent 1',
      created_date: '2025-04-06',
      status: CdTicketStatus.IN_PROGRESS,
      priority: CdTicketPriority.LOW,
      description: 'Inquiry about API documentation.',
      resolution_note: 'Providing the user with the API documentation link.',
      title: 'API Documentation Request',
      detailedDescription:
        'User F is requesting access to the API documentation for integration purposes.',
    },
    {
      ticket_id: 'CD-TKT-007',
      created_by: 'User G',
      cdassigned_to: 'Support Agent 3',
      created_date: '2025-04-07',
      status: CdTicketStatus.RESOLVED,
      priority: CdTicketPriority.MEDIUM,
      description: 'Issue with email notifications.',
      resolution_note:
        'Email configuration updated. Notifications are now being sent correctly.',
      title: 'Email Notification Problems',
      detailedDescription:
        'Users were not receiving email notifications for certain events. This has been resolved.',
    },
  ];

  constructor(private http: HttpClient) {}

  getTicketById(id: string): CdViewTicketDetails | undefined {
    return this.ticketStore.find((ticket) => ticket.ticket_id === id);
  }

  getActivitiesForTicket(ticketId: string): Activity[] {
    const ticket = this.getTicketById(ticketId);
    return ticket?.activities || [];
  }

  addActivity(ticketId: string, activity: Activity): void {
    const ticket = this.getTicketById(ticketId);
    if (ticket) {
      if (!ticket.activities) ticket.activities = [];
      ticket.activities.push(activity);
    }
  }

  updateActivityComment(
    ticketId: string,
    index: number,
    newComment: string
  ): void {
    const ticket = this.getTicketById(ticketId);
    if (ticket?.activities && ticket.activities[index]) {
      ticket.activities[index].comment = newComment;
    }
  }

  updateTicketById(id: string, updates: Partial<CdViewTicketDetails>): boolean {
    const index = this.ticketStore.findIndex((t) => t.ticket_id === id);
    if (index > -1) {
      this.ticketStore[index] = {
        ...this.ticketStore[index],
        ...updates,
      };
      return true;
    }
    return false;
  }

  //   updateTicketById(id: string, updates: Partial<CdViewTicketDetails>): Observable<CdViewTicketDetails> {
  //   return this.http.patch<CdViewTicketDetails>(`${this.apiUrl}/${id}`, updates);
  // }
}
