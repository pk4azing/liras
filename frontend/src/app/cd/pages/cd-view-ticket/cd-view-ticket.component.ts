import { Component } from '@angular/core';
import {
  CdTicketPriority,
  CdTickets,
  CdTicketStatus,
} from '../../cd-components/cd-ticket-table-component/cd-ticket-table-component.component';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, Location } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CdTitleServiceService } from '../../cd-services/cd-title-service/cd-title-service.service';
import { CdEditTicketDialogComponent } from '../../cd-components/cd-edit-ticket-dialog/cd-edit-ticket-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CdViewTicketServiceService } from '../../cd-services/cd-view-ticket-service/cd-view-ticket-service.service';

interface CdViewTicketDetails extends CdTickets {
  title: string;
  detailedDescription: string;
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

@Component({
  selector: 'app-cd-view-ticket',
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatButtonModule,
    MatIconModule,
    ReactiveFormsModule,
    MatTooltipModule,
  ],
  templateUrl: './cd-view-ticket.component.html',
  styleUrl: './cd-view-ticket.component.scss',
})
export class CdViewTicketComponent {
  homeTitle: string = 'View Tickets';

  ticketDetails: CdViewTicketDetails | undefined;
  editMode = false;
  editTicketForm: FormGroup;

  // dummyTickets: CdViewTicketDetails[] = [
  //   {
  //     ticket_id: 'CD-TKT-001',
  //     created_by: 'User A',
  //     cdassigned_to: 'Support Agent 1',
  //     created_date: '2025-04-01',
  //     status: CdTicketStatus.OPEN,
  //     priority: CdTicketPriority.HIGH,
  //     description: 'Issue with login functionality.',
  //     resolution_note: '',
  //     title: 'Login Error',
  //     detailedDescription:
  //       'Users are unable to log in to the application. This is a critical issue affecting all users.',
  //   },
  //   {
  //     ticket_id: 'CD-TKT-002',
  //     created_by: 'User B',
  //     cdassigned_to: 'Support Agent 2',
  //     created_date: '2025-04-02',
  //     status: CdTicketStatus.IN_PROGRESS,
  //     priority: CdTicketPriority.MEDIUM,
  //     description: 'Request for a new feature.',
  //     resolution_note: 'Currently being analyzed.',
  //     title: 'New Feature Request: Dashboard Customization',
  //     detailedDescription:
  //       'User B has requested the ability to customize their dashboard with different widgets and layouts.',
  //   },
  //   {
  //     ticket_id: 'CD-TKT-003',
  //     created_by: 'User C',
  //     cdassigned_to: 'Support Agent 1',
  //     created_date: '2025-04-03',
  //     status: CdTicketStatus.RESOLVED,
  //     priority: CdTicketPriority.LOW,
  //     description: 'Minor UI issue on the profile page.',
  //     resolution_note: 'Issue resolved by updating the CSS.',
  //     title: 'Profile Page UI Alignment',
  //     detailedDescription:
  //       'There is a slight alignment issue with the user profile information displayed on the profile page.',
  //   },
  //   {
  //     ticket_id: 'CD-TKT-004',
  //     created_by: 'User D',
  //     cdassigned_to: 'Support Agent 3',
  //     created_date: '2025-04-04',
  //     status: CdTicketStatus.CLOSED,
  //     priority: CdTicketPriority.MEDIUM,
  //     description: 'Problem with report generation.',
  //     resolution_note:
  //       'Root cause identified and fixed. Report generation is now working.',
  //     title: 'Report Generation Failure',
  //     detailedDescription:
  //       'Users were unable to generate specific reports. The underlying issue has been resolved.',
  //   },
  //   {
  //     ticket_id: 'CD-TKT-005',
  //     created_by: 'User E',
  //     cdassigned_to: 'Support Agent 2',
  //     created_date: '2025-04-05',
  //     status: CdTicketStatus.OPEN,
  //     priority: CdTicketPriority.HIGH,
  //     description: 'Slow performance when viewing deployment history.',
  //     resolution_note: '',
  //     title: 'Performance Degradation',
  //     detailedDescription:
  //       'The system is experiencing significant performance slowdowns, impacting user productivity.',
  //   },
  //   {
  //     ticket_id: 'CD-TKT-006',
  //     created_by: 'User F',
  //     cdassigned_to: 'Support Agent 1',
  //     created_date: '2025-04-06',
  //     status: CdTicketStatus.IN_PROGRESS,
  //     priority: CdTicketPriority.LOW,
  //     description: 'Inquiry about API documentation.',
  //     resolution_note: 'Providing the user with the API documentation link.',
  //     title: 'API Documentation Request',
  //     detailedDescription:
  //       'User F is requesting access to the API documentation for integration purposes.',
  //   },
  //   {
  //     ticket_id: 'CD-TKT-007',
  //     created_by: 'User G',
  //     cdassigned_to: 'Support Agent 3',
  //     created_date: '2025-04-07',
  //     status: CdTicketStatus.RESOLVED,
  //     priority: CdTicketPriority.MEDIUM,
  //     description: 'Issue with email notifications.',
  //     resolution_note:
  //       'Email configuration updated. Notifications are now being sent correctly.',
  //     title: 'Email Notification Problems',
  //     detailedDescription:
  //       'Users were not receiving email notifications for certain events. This has been resolved.',
  //   },
  // ];

  activities: Activity[] = [
    // {
    //   type: 'status',
    //   user: 'Kiran',
    //   timestamp: 'February 28, 2024 at 3:07 PM',
    //   field: 'Status',
    //   fromValue: 'In Progress',
    //   toValue: 'Resolved',
    // },
    // {
    //   type: 'assignee',
    //   user: 'Random User',
    //   timestamp: 'February 27, 2024 at 3:07 PM',
    //   field: 'Assignee',
    //   fromValue: 'Random User',
    //   toValue: 'Kiran',
    //   comment: 'Assigning to you Lorem, ipsum dolor sit amet...',
    // },
    // {
    //   type: 'severity',
    //   user: 'Prasanna Kumar Tatiparthi',
    //   timestamp: 'February 25, 2024 at 3:07 PM',
    //   field: 'Severity',
    //   fromValue: 'Medium',
    //   toValue: 'High',
    // },
    // {
    //   type: 'severity',
    //   user: 'Prasanna Kumar Tatiparthi',
    //   timestamp: 'February 26, 2024 at 3:07 PM',
    //   field: 'Severity',
    //   fromValue: 'Medium',
    //   toValue: 'High',
    // },
    // {
    //   type: 'assigned',
    //   user: 'Prasanna Kumar Tatiparthi',
    //   timestamp: 'February 23, 2024 at 3:07 PM',
    //   field: 'Issue',
    // },
    // {
    //   type: 'created',
    //   user: 'Akhil',
    //   timestamp: 'February 22, 2024 at 3:07 PM',
    //   field: 'Issue',
    // },
    // {
    //   type: 'comment',
    //   user: 'SON',
    //   timestamp: 'February 29, 2024 at 10:00 AM',
    //   comment: 'This is a comment added by SON.',
    // },
  ];

  newComment: string = '';
  ticketId: string = '';
  editingCommentIndex: number | null = null;
  originalComments: { [key: number]: string } = {};

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private router: Router,
    private location: Location,
    private titleService: CdTitleServiceService,
    private dialog: MatDialog,
    private ticketDetailsService: CdViewTicketServiceService
  ) {
    this.editTicketForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
    });
  }

  goBack(): void {
    this.location.back();
  }

  getTicketDetails(id: string): void {
    this.ticketDetails = this.ticketDetailsService.getTicketById(id);
    if (this.ticketDetails) {
      this.initializeForm();
    }
  }

  initializeForm(): void {
    this.editTicketForm = this.fb.group({
      description: [this.ticketDetails?.description || '', Validators.required],
      detailedDescription: [
        this.ticketDetails?.detailedDescription || '',
        Validators.required,
      ],
    });
  }

  enableEditMode(): void {
    if (!this.ticketDetails) return;

    const dialogRef = this.dialog.open(CdEditTicketDialogComponent, {
      width: '600px',
      data: { ...this.ticketDetails },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result && this.ticketDetails?.ticket_id) {
        const success = this.ticketDetailsService.updateTicketById(
          this.ticketDetails.ticket_id,
          result
        );

        if (success) {
          // Refresh local ticketDetails from service
          const updated = this.ticketDetailsService.getTicketById(
            this.ticketDetails.ticket_id
          );
          if (updated) this.ticketDetails = updated;

          this.snackBar.open('Ticket details updated successfully!', 'Close', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
          });
        } else {
          this.snackBar.open('Failed to update ticket.', 'Close', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
          });
        }
      }
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.ticketId = params['id'];
      if (this.ticketId) {
        const ticket = this.ticketDetailsService.getTicketById(this.ticketId);
        if (ticket) {
          this.ticketDetails = ticket;
          this.activities = this.ticketDetailsService.getActivitiesForTicket(
            this.ticketId
          );
        }
      }
    });

    this.titleService.currentHomeTitle.subscribe((title) => {
      this.homeTitle = title;
    });
  }

  saveChanges(): void {
    if (this.editTicketForm.valid && this.ticketDetails) {
      this.ticketDetails.description = this.editTicketForm.value.description;
      this.ticketDetails.detailedDescription =
        this.editTicketForm.value.detailedDescription;

      // In a real application, you would send these changes to your backend
      console.log('Updated ticket details:', this.ticketDetails);

      this.snackBar.open('Ticket details updated successfully!', 'Close', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
      });
      this.editMode = false; // Exit edit mode after saving
    } else {
      this.snackBar.open('Please fill in all required fields.', 'Close', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
      });
    }
  }

  // Method to cancel editing
  cancelEdit(): void {
    this.editMode = false;
    this.initializeForm(); // Reset the form to the original values
  }

  // comment functionalities
  isCommentEmpty(): boolean {
    return this.newComment.trim() === '';
  }

  canEdit(commentUser: string): boolean {
    const loggedInUser = (localStorage.getItem('username') || '')
      .trim()
      .toLowerCase();
    const commentUserNormalized = commentUser.trim().toLowerCase();
    console.log('Logged-in User:', loggedInUser);
    console.log('Comment User:', commentUserNormalized);
    return loggedInUser === commentUserNormalized;
  }

  tryStartEditing(index: number): void {
    const commentUser = this.activities[index].user;

    if (this.canEdit(commentUser)) {
      this.editingCommentIndex = index;
      this.originalComments[index] = this.activities[index].comment || '';
    } else {
      console.log('Edit not allowed. User mismatch.');
    }
  }
  cancelEditing(index: number): void {
    this.activities[index].comment = this.originalComments[index];
    this.editingCommentIndex = null;
  }

  submitComment() {
    if (this.newComment.trim()) {
      this.activities.push({
        type: 'comment',
        user: 'Current User',
        timestamp: new Date().toLocaleString(),
        comment: this.newComment.trim(),
      });
      this.newComment = '';
    }
  }

  postNewComment(): void {
    const username = localStorage.getItem('username') || 'Unknown User';

    const newActivity: Activity = {
      type: 'comment',
      user: username,
      timestamp: new Date().toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      }),
      comment: this.newComment.trim(),
    };

    this.ticketDetailsService.addActivity(this.ticketId, newActivity);
    this.activities = this.ticketDetailsService.getActivitiesForTicket(
      this.ticketId
    );
    this.newComment = '';
  }

  updateComment(index: number): void {
    const updatedComment = this.activities[index].comment || '';
    this.ticketDetailsService.updateActivityComment(
      this.ticketId,
      index,
      updatedComment
    );
    this.activities = this.ticketDetailsService.getActivitiesForTicket(
      this.ticketId
    );
    this.editingCommentIndex = null;
  }

  isCommentChanged(index: number): boolean {
    return this.activities[index].comment !== this.originalComments[index];
  }
}
