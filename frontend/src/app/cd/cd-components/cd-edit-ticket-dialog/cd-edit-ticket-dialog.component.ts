import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CdTickets } from '../cd-ticket-table-component/cd-ticket-table-component.component'; // Adjust to your model
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';


interface CdViewTicketDetails extends CdTickets {
  title: string;
  detailedDescription: string;
}

@Component({
  selector: 'app-cd-edit-ticket-dialog',
  imports: [
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    ReactiveFormsModule,
    CommonModule
  ],
  templateUrl: './cd-edit-ticket-dialog.component.html',
  styleUrl: './cd-edit-ticket-dialog.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class CdEditTicketDialogComponent {

  editForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<CdEditTicketDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: CdViewTicketDetails,
    private fb: FormBuilder
  ) {
    this.editForm = this.fb.group({
      description: [data.description, Validators.required],
      detailedDescription: [data.detailedDescription, Validators.required],
    });
  }

  onSave(): void {
    if (this.editForm.valid) {
      this.dialogRef.close(this.editForm.value);
    }
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }


}
