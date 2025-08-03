import { CommonModule } from '@angular/common';
import { Component, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-ccd-activity-upload',
  imports: [MatIconModule, MatButtonModule, CommonModule],
  templateUrl: './ccd-activity-upload.component.html',
  styleUrls: ['./ccd-activity-upload.component.scss',
    '../../../styles/style.min.css',
  ],
})
export class CcdActivityUploadComponent {

  selectedFiles: File[] = [];
  isDragging = false; // For styling drag hover effect


  constructor(private dialogRef: MatDialogRef<CcdActivityUploadComponent>) {}

  onFileSelected(event: any): void {
    const files: FileList = event.target.files;
    for (let i = 0; i < files.length; i++) {
      this.selectedFiles.push(files[i]);
    }
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    if (event.dataTransfer?.files) {
      this.addFiles(event.dataTransfer.files);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;
  }

  addFiles(files: FileList): void {
    for (let i = 0; i < files.length; i++) {
      this.selectedFiles.push(files[i]);
    }
  }


  removeFile(index: number): void {
    this.selectedFiles.splice(index, 1);
  }

  onSubmit(): void {
    this.dialogRef.close(this.selectedFiles); // passing the actual File[] array
  }
  
  onCancel(): void {
    this.dialogRef.close();
  }
}



