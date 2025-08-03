import { ChangeDetectorRef, Component } from '@angular/core';
import { CcdTitleServiceService } from '../../ccd-services/ccd-title-service/ccd-title-service.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CcdActivityUploadComponent } from '../../ccd-components/ccd-activity-upload/ccd-activity-upload.component';
import { CcdReportUploadServiceService } from '../../ccd-services/ccd-report-upload-service/ccd-report-upload-service.service';
import { CommonModule } from '@angular/common';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CcdSuccessfulValidationsComponent } from '../../ccd-components/ccd-successful-validations/ccd-successful-validations.component';
import { CcdFailedValidationsComponent } from '../../ccd-components/ccd-failed-validations/ccd-failed-validations.component';
import { CcdOldActivityComponent } from '../../ccd-components/ccd-old-activity/ccd-old-activity.component';


interface ActivityData {
  id: string;
  date: Date;
}

interface ValidatingFile {
  name: string;
  type: string;
  startTime: number;
  remainingTime: number;
}




@Component({
  selector: 'app-ccd-activity',
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    CcdSuccessfulValidationsComponent,
    CcdFailedValidationsComponent,
    CcdOldActivityComponent
  ],
  templateUrl: './ccd-activity.component.html',
  styleUrls: ['./ccd-activity.component.scss',
    '../../../styles/style.min.css',
  ],
})
export class CcdActivityComponent {

  homeTitle: string = 'Home';
  activeTab: 'new' | 'old' = 'new';


  currentDateTime: Date = new Date();
  private intervalId: any;

  activity: ActivityData | null = null;
  activityGenerated = false;

  uploadingFiles: any[] = [];
  validatingFiles: ValidatingFile[] = [];
  successfulFiles: any[] = [];
  failedFiles: any[] = [];

  constructor(
    private titleService: CcdTitleServiceService,
    public dialog: MatDialog,
    private uploadService: CcdReportUploadServiceService,
    private cdr: ChangeDetectorRef,
    private snackBar: MatSnackBar
  ) { }


  ngOnInit(): void {
    this.intervalId = setInterval(() => {
      this.currentDateTime = new Date();
    }, 1000);

    this.titleService.currentHomeTitle.subscribe(title => {
      this.homeTitle = title;
    });

  }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  switchTab(tab: 'new' | 'old') {
    this.activeTab = tab;
  }


  // upload code
  openUploadDialog(): void {
    const dialogRef = this.dialog.open(CcdActivityUploadComponent, {
      width: '500px',
      panelClass: 'bgw',
    });

    dialogRef.afterClosed().subscribe((selectedFiles: File[]) => {
      if (selectedFiles && selectedFiles.length > 0) {
        for (const file of selectedFiles) {
          this.uploadingFiles.push({
            fileObject: file,
            name: file.name,
            size: file.size,
            type: file.type,
            uploadedSize: '0 KB',
            progress: 0,
          });
        }

        // Now start fake uploading
        for (let i = 0; i < this.uploadingFiles.length; i++) {
          this.startProgress(this.uploadingFiles[i].fileObject, i);
        }
      }
    });
  }

  handleRetryUpload(): void {
    console.log('Retrying upload: clearing failed files and opening dialog.');
    this.failedFiles = [];
    this.cdr.detectChanges();
    this.openUploadDialog();
  }

  async startProgress(file: File, index: number) {
    const filteredFile = this.uploadingFiles
      .filter((u, idx) => idx === index)
      .pop();

    if (!filteredFile) return;

    const fileSize = this.uploadService.getFileSize(file.size);
    const fileSizeInWords = this.uploadService.getFileSizeUnit(file.size);

    filteredFile.isComplete = false;
    filteredFile.isRemoving = false;

    // Simulate upload animation
    for (
      let uploaded = 0;
      uploaded < fileSize + fileSize * 0.0001;
      uploaded += fileSize * 0.01
    ) {
      filteredFile.uploadedSize = uploaded.toFixed(2) + ' ' + fileSizeInWords;
      const percentUploaded = Math.round((uploaded / fileSize) * 100);
      filteredFile.progress = percentUploaded;
      await this.fakeWaiter(Math.floor(Math.random() * 35) + 1);
      this.cdr.detectChanges();
    }

    filteredFile.progress = 100;
    filteredFile.uploadedSize = fileSize + ' ' + fileSizeInWords;
    filteredFile.isComplete = true;
    this.cdr.detectChanges();

    const formData = new FormData();
    formData.append('file', file);

    this.uploadService.uploadMedia(formData).subscribe({
      next: (res) => {
        if (res.status === 'completed') {
          console.log(`[UPLOAD SUCCESS] ${file.name}`);
        }
      },
      error: (err) => {
        console.error(`[UPLOAD FAILED] ${file.name}: ${err.message || err}`);
      }
    });

    setTimeout(() => {
      filteredFile.isRemoving = true;
      this.cdr.detectChanges();

      setTimeout(() => {
        this.uploadingFiles = this.uploadingFiles.filter(
          (f: any, idx: number) => idx !== index
        );
        this.cdr.detectChanges();

        this.moveToValidation(filteredFile);
      }, 1000);
    }, 1000);
  }
  // async startProgress(file: File, index: number) {
  //   const filteredFile = this.uploadingFiles
  //     .filter((u, idx) => idx === index)
  //     .pop();

  //   if (filteredFile != null) {
  //     const fileSize = this.uploadService.getFileSize(file.size);
  //     const fileSizeInWords = this.uploadService.getFileSizeUnit(file.size);

  //     filteredFile.isComplete = false;
  //     filteredFile.isRemoving = false;
  //     filteredFile.hasError = false;  // Reset error state

  //     console.log(`[UPLOAD] Starting upload for file: ${file.name}`);

  //     const formData = new FormData();
  //     formData.append('file', file);

  //     this.uploadService.uploadMedia(formData).subscribe({
  //       next: (res) => {
  //         if (res.status === 'progress') {
  //           filteredFile.progress = res.message as number;
  //           filteredFile.uploadedSize =
  //             (fileSize * (filteredFile.progress / 100)).toFixed(2) + ' ' + fileSizeInWords;
  //           this.cdr.detectChanges();
  //         } else if (res.status === 'completed') {
  //           filteredFile.progress = 100;
  //           filteredFile.uploadedSize = fileSize + ' ' + fileSizeInWords;
  //           filteredFile.isComplete = true;
  //           this.cdr.detectChanges();

  //           setTimeout(() => {
  //             filteredFile.isRemoving = true;
  //             this.cdr.detectChanges();
  //             setTimeout(() => {
  //               this.uploadingFiles = this.uploadingFiles.filter((f, idx) => idx !== index);
  //               this.cdr.detectChanges();
  //               this.moveToValidation(filteredFile);
  //             }, 1000);
  //           }, 1000);
  //         }
  //       },
  //       error: (err) => {
  //         console.error('[UPLOAD] Upload failed:', err.error?.message || err.message);
  //         // Set error state and message
  //         filteredFile.progress = 0;
  //         filteredFile.uploadedSize = '0 ' + fileSizeInWords;
  //         filteredFile.isComplete = false;
  //         filteredFile.hasError = true;
  //         // console.error('[FLASK REJECTED YOU]', err.message || err.error?.message); 

  //         filteredFile.errorMessage = err.message;  // Show Flask's error message
  //         this.cdr.detectChanges();
  //       }
  //     });
  //   }
  // }


  fakeWaiter(ms: number) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }

  private activityCounter = 1; // start counter

  generateActivityId(): string {
    const id = `ACT${this.activityCounter.toString().padStart(2, '0')}`;
    this.activityCounter++;
    return id;
  }

  // Validation
  moveToValidation(file: any) {

    if (!this.activityGenerated) {
      this.activity = {
        id: this.generateActivityId(), // once
        date: new Date() // once
      };
      this.activityGenerated = true; // prevent re-generation
    }

    const validatingFile: ValidatingFile = {
      name: file.name,
      type: file.type,
      startTime: Date.now(),
      remainingTime: 50, // Start with 60 seconds (1 minute)
    };

    this.validatingFiles.push(validatingFile);
    this.uploadingFiles = [];

    // Start countdown timer for validation
    const countdownInterval = setInterval(() => {
      validatingFile.remainingTime -= 1; // Decrease remaining time by 1 second
      this.cdr.detectChanges(); // Trigger change detection for timer updates

      if (validatingFile.remainingTime <= 0) {
        clearInterval(countdownInterval); // Stop the countdown when timer reaches 0
        this.validateFile(validatingFile); // Trigger validation when time is up
      }
    }, 1000); // Update every second
  }

  // In your parent component
  // validateFile(file: ValidatingFile) {
  //   const isSuccess = file.type.includes('pdf') || file.type.includes('csv');

  //   if (isSuccess) {
  //     console.log(`Validation successful for ${file.name}`);
  //     this.snackBar.open(`${file.name} validated successfully ✅`, '', {
  //       duration: 3000,
  //       verticalPosition: 'top',
  //     });

  //     // Create a NEW array reference to trigger change detection
  //     this.successfulFiles = [
  //       ...this.successfulFiles,
  //       {
  //         activityId: `ACT-${Date.now()}-001`,
  //         fileName: file.name,
  //         uploadedDate: new Date().toISOString(),
  //         expiryDate: new Date(
  //           new Date().setFullYear(new Date().getFullYear() + 1)
  //         ).toISOString(),
  //       },
  //     ];
  //   } else {
  //     console.log(`Validation failed for ${file.name}`);
  //     this.snackBar.open(`${file.name} validation failed ❌`, '', {
  //       duration: 3000,
  //       verticalPosition: 'top',
  //     });

  //     this.failedFiles = [
  //       ...this.failedFiles,
  //       {
  //         activityId: `ACT-${Date.now()}-002`,
  //         fileName: file.name,
  //         uploadedDate: new Date().toISOString(),
  //         failReason: 'Unsupported file type', // You can customize error messages
  //       },
  //     ];
  //   }

  //   // Remove from validating list
  //   this.validatingFiles = this.validatingFiles.filter(
  //     (f) => f.name !== file.name
  //   );
  //   this.cdr.detectChanges();
  // }

  validateFile(file: ValidatingFile) {
    this.uploadService.validateFileName(file.name).subscribe({
      next: (res) => {
        // Log full response from backend
        console.log('[VALIDATION RESPONSE]', res);
  
        const { status, activityId, validatedAt, reason } = res;
  
        if (status === 'success') {
          console.log(`[ACTION] File "${file.name}" moved to successfulFiles`);
  
          this.snackBar.open(`${file.name} validated successfully ✅`, '', {
            duration: 3000,
            verticalPosition: 'top',
          });
  
          this.successfulFiles = [
            ...this.successfulFiles,
            {
              activityId: activityId || `ACT-${Date.now()}-001`,
              fileName: file.name,
              uploadedDate: validatedAt || new Date().toISOString(),
              expiryDate: new Date(
                new Date(validatedAt || Date.now()).setFullYear(new Date().getFullYear() + 1)
              ).toISOString(),
            },
          ];
        } else {
          console.log(`[ACTION] File "${file.name}" moved to failedFiles - Reason: ${reason}`);
  
          this.snackBar.open(`${file.name} validation failed ❌`, '', {
            duration: 3000,
            verticalPosition: 'top',
          });
  
          this.failedFiles = [
            ...this.failedFiles,
            {
              activityId: activityId || `ACT-${Date.now()}-002`,
              fileName: file.name,
              uploadedDate: validatedAt || new Date().toISOString(),
              failReason: reason || 'Unsupported file type',
            },
          ];
        }
  
        // Remove from validating list
        this.validatingFiles = this.validatingFiles.filter((f) => f.name !== file.name);
        this.cdr.detectChanges();
      },
  
      error: (err) => {
        console.error('[VALIDATION ERROR]', err);
  
        this.snackBar.open(`${file.name} validation failed ❌`, '', {
          duration: 3000,
          verticalPosition: 'top',
        });
  
        console.log(`[ACTION] File "${file.name}" moved to failedFiles - Reason: Server/network error`);
  
        this.failedFiles = [
          ...this.failedFiles,
          {
            activityId: `ACT-${Date.now()}-003`,
            fileName: file.name,
            uploadedDate: new Date().toISOString(),
            failReason: 'Server error or network issue',
          },
        ];
  
        this.validatingFiles = this.validatingFiles.filter((f) => f.name !== file.name);
        this.cdr.detectChanges();
      }
    });
  }
  



  // Snackbar display function
  showSnackbar(message: string, type: 'success' | 'error') {
    this.snackBar.open(message, 'Dismiss', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: type === 'success' ? 'snackbar-success' : 'snackbar-error',
    });
  }

  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${this.padZero(minutes)}:${this.padZero(remainingSeconds)}`;
  }

  padZero(value: number): string {
    return value < 10 ? `0${value}` : `${value}`;
  }



}
