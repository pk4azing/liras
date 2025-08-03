import { HttpClient, HttpErrorResponse, HttpEvent, HttpEventType, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, tap, throwError } from 'rxjs';

interface ValidationResponse {
  status: 'success' | 'fail';
  activityId: string;
  validatedAt: string;
}


@Injectable({
  providedIn: 'root'
})
export class CcdReportUploadServiceService {

  fileSizeUnit: number = 1024;
  public isApiSetup = false;

  constructor(private http: HttpClient) { }

  getFileSize(fileSize: number): number {
    if (fileSize > 0) {
      if (fileSize < this.fileSizeUnit * this.fileSizeUnit) {
        fileSize = parseFloat((fileSize / this.fileSizeUnit).toFixed(2));
      } else if (
        fileSize <
        this.fileSizeUnit * this.fileSizeUnit * this.fileSizeUnit
      ) {
        fileSize = parseFloat(
          (fileSize / this.fileSizeUnit / this.fileSizeUnit).toFixed(2)
        );
      }
    }

    return fileSize;
  }

  getFileSizeUnit(fileSize: number) {
    let fileSizeInWords = 'bytes';

    if (fileSize > 0) {
      if (fileSize < this.fileSizeUnit) {
        fileSizeInWords = 'bytes';
      } else if (fileSize < this.fileSizeUnit * this.fileSizeUnit) {
        fileSizeInWords = 'KB';
      } else if (
        fileSize <
        this.fileSizeUnit * this.fileSizeUnit * this.fileSizeUnit
      ) {
        fileSizeInWords = 'MB';
      }
    }

    return fileSizeInWords;
  }

  uploadMedia(formData: FormData): Observable<{ status: string; message?: string | number; data?: any }> {
    return this.http.post('http://localhost:5312/upload', formData, {
      reportProgress: true,
      observe: 'events'
    }).pipe(
      map((event: HttpEvent<any>) => {
        switch (event.type) {
          case HttpEventType.Response:
            console.log('[UPLOAD SUCCESS]', event.body);
            return {
              status: 'completed',
              message: 'Upload successful',
              data: event.body
            };

          case HttpEventType.UploadProgress:
            const progress = event.total
              ? Math.round((100 * event.loaded) / event.total)
              : 0;
            return { status: 'progress', message: progress };

          default:
            return { status: 'pending' };
        }
      }),
      catchError((error: HttpErrorResponse) => {
        // Extract the custom message from Flask's response
        const flaskError = error.error?.message || 'Upload failed';
        console.error('[FLASK ERROR]', flaskError); // This will show "YOU HAVE FAILED THE CITY"

        return throwError(() => ({
          status: 'error',
          message: flaskError,  // Now contains the custom message
          error: error
        }));
      })
    );
  }

  sendValidationRequest(fileName: string, fileType: string): Observable<ValidationResponse> {
    return this.http.post<ValidationResponse>('http://localhost:5312/validate', {
      fileName,
      fileType,
    });
  }

  validateFileName(fileName: string): Observable<{ status: string; activityId?: string; validatedAt?: string; reason?: string }> {
    return this.http.post<{ status: string; activityId?: string; validatedAt?: string; reason?: string }>(
      'http://localhost:5312/validate',
      { fileName }
    );
  }

}
