import { Injectable } from '@angular/core';

export interface ActivityCard {
  label: string;
  icon: string;
  colorClass: string;
  value: string;
}

@Injectable({
  providedIn: 'root'
})
export class CcdActivityDataServiceService {

  private showData = true; 

  constructor() { }

  private activityCards: ActivityCard[] = [
    {
      label: 'Activity Start Time',
      icon: 'fa fa-hourglass-start',
      colorClass: 'bg-primary',
      value: 'June 16, 2025 09:00 AM'
    },
    {
      label: 'Activity End Time',
      icon: 'fa fa-hourglass-end',
      colorClass: 'bg-success',
      value: 'June 16, 2025 05:00 PM'
    },
    {
      label: 'No of Files Uploaded',
      icon: 'fa-file',
      colorClass: 'bg-info',
      value: '25'
    }
  ];

  getActivityCards(): ActivityCard[] {
    return this.showData ? this.activityCards : [];
  }
}
