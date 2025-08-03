import {
  Component,
  Inject,
  Output,
  EventEmitter,
  ViewEncapsulation,
  OnInit,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import {
  CdTicketPriority,
  CdTicketsServiceService,
  CdTicketStatus,
} from '../../cd-services/cd-tickets-service/cd-tickets-service.service';
import { formatDate } from '@angular/common';

@Component({
  selector: 'app-cd-create-ticket-component',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDialogModule,
    MatSnackBarModule,
    CommonModule,
  ],
  templateUrl: './cd-create-ticket-component.component.html',
  styleUrl: './cd-create-ticket-component.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class CdCreateTicketComponentComponent implements OnInit {
  ticketForm: FormGroup;
  currentUserName = '';
  createdTime: string = '';
  dummyAssignedToOptions = [
    'Support Team A',
    'Support Team B',
    'Tech Agent 1',
    'Agent Smith',
    'Customer Support Alpha',
  ];

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<CdCreateTicketComponentComponent>,
    private ticketService: CdTicketsServiceService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.ticketForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      priority: [CdTicketPriority.MEDIUM, Validators.required], // Add dropdown for priority
    });
  }

  ngOnInit(): void {
    const storedName = localStorage.getItem('username');
    this.currentUserName = storedName ? storedName : 'Unknown User';
  }

  private getFormattedToday(): string {
    return formatDate(new Date(), 'yyyy-MM-dd', 'en-IN');
  }

  private getRandomAssignedTo(): string {
    const index = Math.floor(
      Math.random() * this.dummyAssignedToOptions.length
    );
    return this.dummyAssignedToOptions[index];
  }

  onCancel(): void {
    this.dialogRef.close({ cancelled: true });
  }

  onSubmit(): void {
    if (this.ticketForm.valid) {
      const ticketData = {
        created_by: this.currentUserName,
        cdassigned_to: this.getRandomAssignedTo(),
        created_date: this.getFormattedToday(),
        status: CdTicketStatus.OPEN,
        priority: this.ticketForm.value.priority,
        description: this.ticketForm.value.description,
        resolution_note: '',
      };

      this.ticketService.addTicket(ticketData);

      this.snackBar.open('Ticket has been successfully created', 'Close', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
      });

      this.dialogRef.close({ cancelled: false });
    } else {
      this.snackBar.open('Please fill in all required fields', 'Close', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
      });
    }
  }
}
