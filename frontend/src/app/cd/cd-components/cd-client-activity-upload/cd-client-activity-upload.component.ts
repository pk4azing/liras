import { MatIcon, MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import {
  Component,
  OnInit,
  NgModule,
  ViewChild,
  ElementRef,
  ChangeDetectorRef,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  FormsModule
} from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject, takeUntil } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatSelect } from '@angular/material/select';
import {
  MatOptionModule,
  provideNativeDateAdapter,
} from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { CdClientReportUploadServiceService } from '../../cd-services/cd-client-report-upload-service/cd-client-report-upload-service.service';
import { CdModeDirectiveDirective } from '../../cd-directives/cd-mode-directive/cd-mode-directive.directive';

@Component({
  selector: 'app-cd-client-activity-upload',
  imports: [
    MatButtonModule,
    CommonModule,
    MatOptionModule,
    MatInputModule,
    MatDatepickerModule,
    ReactiveFormsModule,
    CdModeDirectiveDirective,
    FormsModule
  ],
  templateUrl: './cd-client-activity-upload.component.html',
  styleUrl: './cd-client-activity-upload.component.scss',
  providers: [provideNativeDateAdapter(), CdClientReportUploadServiceService]
})
export class CdClientActivityUploadComponent {
  isGenerated: boolean = false;
  configFilePreview: string = '';
  textFilePreview: string = '';
  isCreating: boolean = false;
  generated_by: string = 'John Doe';
  generated_date: string = new Date().toISOString();

  reportForm: FormGroup;
  selectedFileNames: string[] = [];
  selectedFiles: File[] = [];

  uploadedConfigFiles: Array<any> = [];
  uploadedTextFiles: Array<any> = [];

  editINI: boolean = false;
  editText: boolean = false;


  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private reportService: CdClientReportUploadServiceService
  ) {
    this.reportForm = this.fb.group({
      configFiles: [null, Validators.required],
      textFiles: [null, Validators.required],
    });
  }

  onConfigFileBrowse(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      const filesArray = Array.from(target.files);
      this.processFiles(filesArray, 'config');
    } else {
      console.warn('No config files selected.');
    }
  }

  onTextFileBrowse(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      const filesArray = Array.from(target.files);
      this.processFiles(filesArray, 'text');
    } else {
      console.warn('No text files selected.');
    }
  }

  getFileInputDisplayText(): string {
    return this.selectedFileNames.length > 0
      ? `${this.selectedFileNames.length} file(s) selected`
      : 'Select files to upload';
  }

  onSubmit(): void {
    if (this.reportForm.valid) {
      const formData = {
        configFiles: this.uploadedConfigFiles.map((f) => f.FileName),
        textFiles: this.uploadedTextFiles.map((f) => f.FileName),
        generatedBy: this.generated_by,
        generatedDate: this.generated_date,
      };

      console.log('Submitting report with files:', {
        configFiles: formData.configFiles,
        textFiles: formData.textFiles,
        otherData: {
          generatedBy: formData.generatedBy,
          generatedDate: formData.generatedDate,
        },
      });

      this.snackBar.open('Report submitted successfully!', 'Close', {
        duration: 3000,
        verticalPosition: 'top',
      });

      // this.resetForm();
      this.isGenerated = true;
      this.loadPreviewData(); // fetch preview content

    } else {
      this.snackBar.open('Please upload both config and text files', 'Close', {
        duration: 3000,
        verticalPosition: 'top',
        panelClass: ['error-snackbar'],
      });
    }
  }

  resetForm(): void {
    // Clean up file uploads
    this.uploadedConfigFiles.forEach((file) =>
      file.ngUnsubscribe?.unsubscribe()
    );
    this.uploadedTextFiles.forEach((file) => file.ngUnsubscribe?.unsubscribe());

    // Reset all file arrays
    this.uploadedConfigFiles = [];
    this.uploadedTextFiles = [];

    // Reset form controls
    this.reportForm.reset();
    this.reportForm.markAsUntouched();
    this.isGenerated = false;

  }

  onCreateClick(): void {
    this.isCreating = true;
  }

  processFiles(files: File[], fileType: 'config' | 'text') {
    for (const file of files) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event: ProgressEvent<FileReader>) => {
        if (!event.target?.result) return;

        const fileData = {
          FileName: file.name,
          FileSize:
            this.reportService.getFileSize(file.size) +
            ' ' +
            this.reportService.getFileSizeUnit(file.size),
          FileType: file.type,
          FileUrl: event.target.result as string,
          FileProgessSize: 0,
          FileProgress: 0,
          ngUnsubscribe: new Subject<any>(),
        };

        if (fileType === 'config') {
          this.uploadedConfigFiles.push(fileData);
          this.startProgress(
            file,
            this.uploadedConfigFiles.length - 1,
            'config'
          );
        } else {
          this.uploadedTextFiles.push(fileData);
          this.startProgress(file, this.uploadedTextFiles.length - 1, 'text');
        }
      };
    }
  }

  async startProgress(file: File, index: number, fileType: 'config' | 'text') {
    console.log('startProgress', fileType, index);
    const fileArray =
      fileType === 'config' ? this.uploadedConfigFiles : this.uploadedTextFiles;
    const filteredFile = fileArray.filter((u, idx) => idx === index).pop();

    if (filteredFile != null) {
      console.log('started', fileType, index);

      const fileSize = this.reportService.getFileSize(file.size);
      const fileSizeInWords = this.reportService.getFileSizeUnit(file.size);

      if (this.reportService.isApiSetup) {
        const formData = new FormData();
        formData.append('File', file);

        this.reportService
          .uploadMedia(formData)
          .pipe(takeUntil(filteredFile.ngUnsubscribe))
          .subscribe(
            (res: any) => {
              if (res.status === 'progress') {
                const completedPercentage = parseFloat(res.message);
                filteredFile.FileProgessSize = `${(
                  (fileSize * completedPercentage) /
                  100
                ).toFixed(2)} ${fileSizeInWords}`;
                filteredFile.FileProgress = completedPercentage;
              } else if (res.status === 'completed') {
                filteredFile.Id = res.Id;
                filteredFile.FileProgessSize = fileSize + ' ' + fileSizeInWords;
                filteredFile.FileProgress = 100;
                this.checkAndSetGenerated();

              }
            },
            (error: any) => {
              console.log('file upload error', error);
            }
          );
      } else {
        console.log('else statement', fileType, index);
        for (
          let f = 0;
          f < fileSize + fileSize * 0.0001;
          f += fileSize * 0.01
        ) {
          filteredFile.FileProgessSize = f.toFixed(2) + ' ' + fileSizeInWords;
          const percentUploaded = Math.round((f / fileSize) * 100);
          filteredFile.FileProgress = percentUploaded;
          await this.fakeWaiter(Math.floor(Math.random() * 35) + 1);
        }
      }
    }
  }

  checkAndSetGenerated() {
    const allConfigDone = this.uploadedConfigFiles.every(f => f.FileProgress === 100);
    const allTextDone = this.uploadedTextFiles.every(f => f.FileProgress === 100);
    console.log("called");

    if (allConfigDone && allTextDone) {
      this.isGenerated = true;
      console.log('isGenerated', this.isGenerated);

      // Load preview content from uploaded files
      this.loadPreviewData();
    }
  }

  loadPreviewData() {
    const configFile = this.uploadedConfigFiles[0];
    const textFile = this.uploadedTextFiles[0];

    if (configFile) {
      fetch(configFile.FileUrl)
        .then(res => res.text())
        .then(data => {
          this.configFilePreview = data;
          console.log('configFilePreview', this.configFilePreview);
        });
    }

    if (textFile) {
      fetch(textFile.FileUrl)
        .then(res => res.text())
        .then(data => {
          this.textFilePreview = data;
          console.log('textFilePreview', this.textFilePreview);
        });
    }
  }



  fakeWaiter(ms: number) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }

  removeConfigFile(index: number): void {
    if (this.uploadedConfigFiles[index]) {
      this.uploadedConfigFiles[index].ngUnsubscribe?.next();
      this.uploadedConfigFiles[index].ngUnsubscribe?.complete();
    }
    this.uploadedConfigFiles.splice(index, 1);
    this.reportForm
      .get('configFiles')
      ?.setValue(
        this.uploadedConfigFiles.length > 0 ? this.uploadedConfigFiles : null
      );
  }

  removeTextFile(index: number): void {
    if (this.uploadedTextFiles[index]) {
      this.uploadedTextFiles[index].ngUnsubscribe?.next();
      this.uploadedTextFiles[index].ngUnsubscribe?.complete();
    }
    this.uploadedTextFiles.splice(index, 1);
    this.reportForm
      .get('textFiles')
      ?.setValue(
        this.uploadedTextFiles.length > 0 ? this.uploadedTextFiles : null
      );
  }

  cancelEdit(type: 'ini' | 'text') {
    if (type === 'ini') {
      this.editINI = false;
      this.loadPreviewData(); // Reload original if cancelled
    } else {
      this.editText = false;
      this.loadPreviewData();
    }
  }
  
  // Save INI file content
  saveINI() {
    const payload = { content: this.configFilePreview };
    if (this.isValidINI(payload.content)) {
      console.log('Posting updated INI data:', payload);
      // Replace with actual HTTP POST
      // this.http.post('/api/save-ini', payload).subscribe(...)
      this.editINI = false;
      this.snackBar.open('INI File updated successfully!', 'Close', { duration: 3000 });
    }
  }
  
  // Save Text file content
  saveText() {
    const payload = { content: this.textFilePreview };
    if (this.isValidText(payload.content)) {
      console.log('Posting updated Text data:', payload);
      // Replace with actual HTTP POST
      // this.http.post('/api/save-text', payload).subscribe(...)
      this.editText = false;
      this.snackBar.open('Text File updated successfully!', 'Close', { duration: 3000 });
    }
  }
  
  // Basic validation for INI format
  isValidINI(data: string): boolean {
    const lines = data.split('\n');
    for (let line of lines) {
      line = line.trim();
      if (line === '' || line.startsWith(';') || line.startsWith('#')) continue;
      if (/^\[.*\]$/.test(line)) continue;
      if (!/^.+?=.+$/.test(line)) return false;
    }
    return true;
  }
  
  // Basic validation for Text format (e.g., at least 10 non-space characters)
  isValidText(data: string): boolean {
    return data.trim().length >= 10;
  }
  

}
