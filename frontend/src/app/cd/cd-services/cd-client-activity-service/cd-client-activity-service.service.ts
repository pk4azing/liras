import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface Activity {
  id: string;
  clientId: string;
  activityType: string;
  description: string;
  date: Date;
  uploadedFiles: number;
  completedFiles: number;
  failedFiles: number;
}

@Injectable({
  providedIn: 'root',
})
export class CdClientActivityServiceService {
  private allActivities: Activity[] = [
    {
      id: 'LDC_C_A_W3',
      clientId: 'LDC_C_A_W3',
      activityType: 'Upload',
      description: 'User logged an Activity at',
      date: new Date('2023-11-20'),
      uploadedFiles: 1,
      completedFiles: 1,
      failedFiles: 0,
    },
    {
      id: 'LDC_C_A_W3',
      clientId: 'LDC_C_A_W3',
      activityType: 'Upload',
      description: 'User logged an Activity at',
      date: new Date('2023-11-20'),
      uploadedFiles: 1,
      completedFiles: 1,
      failedFiles: 0,
    },
    {
      id: 'LDC_C_A_W3',
      clientId: 'LDC_C_A_W3',
      activityType: 'Upload',
      description: 'User logged an Activity at',
      date: new Date('2023-11-20'),
      uploadedFiles: 1,
      completedFiles: 1,
      failedFiles: 0,
    },
    {
      id: 'LDC_C_A_W12',
      clientId: 'LDC_C_A_W12',
      activityType: 'Upload',
      description: 'User logged an Activity at',
      date: new Date('2023-11-21'),
      uploadedFiles: 3,
      completedFiles: 2,
      failedFiles: 0,
    },
    {
      id: 'LDC_C_A_W23',
      clientId: 'LDC_C_A_W23',
      activityType: 'Upload',
      description: 'No Activity Recorded',
      date: new Date('2023-11-30'),
      uploadedFiles: 17,
      completedFiles: 17,
      failedFiles: 0,
    },
    {
      id: 'LDC_C_A_W46',
      clientId: 'LDC_C_A_W46',
      activityType: 'Update',
      description: 'User logged an Activity at',
      date: new Date('2023-11-23'),
      uploadedFiles: 0,
      completedFiles: 0,
      failedFiles: 0,
    },
    {
      id: 'LDC_C_A_W35',
      clientId: 'LDC_C_A_W35',
      activityType: 'Upload',
      description: 'User logged an Activity at',
      date: new Date('2023-11-24'),
      uploadedFiles: 5,
      completedFiles: 5,
      failedFiles: 0,
    },
  ];

  constructor() {}

  getActivitiesByClientId(clientId: string): Observable<Activity[]> {
    const filtered = this.allActivities.filter((a) => a.clientId === clientId);
    return of(filtered); // simulate async observable
  }

  downloadActivityFile(activity: Activity): void {
    // For now, simulate download with a console log
    console.log(
      `Downloading file for activity ${activity.id} of client ${activity.clientId}`
    );

    // Example for real file download logic (replace with actual API logic when ready):
    // return this.http.get(`api/activities/${activity.id}/download`, { responseType: 'blob' });

    // You can also use FileSaver.js or similar library to trigger downloads from blobs
  }
}
