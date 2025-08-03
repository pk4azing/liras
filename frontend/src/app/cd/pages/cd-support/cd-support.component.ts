import {
  Component,
  ElementRef,
  EventEmitter,
  inject,
  OnInit,
  Output,
  signal,
  ViewChild,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { CdTicketTableComponentComponent } from '../../cd-components/cd-ticket-table-component/cd-ticket-table-component.component';
import { CdTitleServiceService } from '../../cd-services/cd-title-service/cd-title-service.service';
import { CdCreateTicketComponentComponent } from '../../cd-components/cd-create-ticket-component/cd-create-ticket-component.component';
import { MatDialog } from '@angular/material/dialog';


export interface cdTicketForm {
  title: string;
  description: string;
}

@Component({
  selector: 'app-cd-support',
  imports: [
    MatExpansionModule,
    MatButtonModule,
    CdTicketTableComponentComponent,
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './cd-support.component.html',
  styleUrl: './cd-support.component.scss'
})
export class CdSupportComponent implements OnInit {

  homeTitle: string = 'Home';
  currentUserId: string = '2';
  showDynamicFields = false;

  readonly panelOpenState = signal(false);

  constructor(private titleService: CdTitleServiceService, private dialog: MatDialog) {
  }

  ngOnInit(): void {
    this.titleService.currentHomeTitle.subscribe(title => {
      this.homeTitle = title;
    });
  }


  // openCreateForm() {
  //   this.isCreating = true;
  // }

  openCreateForm() {
    const dialogRef = this.dialog.open(CdCreateTicketComponentComponent, {
      width: '600px',
      autoFocus: false,
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result?.cancelled) {
        console.log('Ticket creation cancelled');
      } else if (result?.ticket) {
        console.log('Ticket created this is from the parent:', result.ticket);
        // Add to dataSource or call backend
      }
    });
  }

  // resetForm() {
  //   console.log('clicked');
  //   this.ticketForm.reset();
  //   this.ticketCancelled = new EventEmitter<void>();
  //   this.isCancelled = true;
  //   this.isCreating = false;
  // }

  // onSubmit() {
  //   if (this.ticketForm.valid) {
  //     this.createdTime = new Date().toISOString();
  //     const formData: cdTicketForm & { createdBy: string; createdTime: string } = {
  //       ...this.ticketForm.value,
  //       createdBy: this.currentUserId,
  //       createdTime : this.createdTime,
  //     };
  //     console.log('New Ticket:', formData);

  //     this.snackBar.open('Ticket has been successfully created', 'Close', {
  //       duration: 3000,
  //       horizontalPosition: 'center',
  //       verticalPosition: 'top',
  //     });

  //     this.ticketForm.reset();
  //     this,this.showDynamicFields = false;
  //   } else {
  //     this.snackBar.open('Please fill in all required fields', 'Close', {
  //       duration: 3000,
  //       horizontalPosition: 'center',
  //       verticalPosition: 'top',
  //     });
  //   }
  //   this.isCancelled = false;
  //   this.isCreating = false;
  // }
  


}
