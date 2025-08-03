import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';
import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { CdModeDirectiveDirective } from '../../cd-directives/cd-mode-directive/cd-mode-directive.directive';
import { CdClientActivityServiceService } from '../../cd-services/cd-client-activity-service/cd-client-activity-service.service';

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

@Component({
  selector: 'app-cd-client-activity',
  imports: [
    MatTableModule,
    CommonModule,
    MatButtonModule,
    MatIconModule,
    CdModeDirectiveDirective,
  ],
  templateUrl: './cd-client-activity.component.html',
  styleUrl: './cd-client-activity.component.scss',
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minheight: '0' })),
      state('expanded', style({ height: '*' })),
      transition(
        'expanded <=> collapsed',
        animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')
      ),
    ]),
  ],
})
export class CdClientActivityComponent implements OnInit {
  @Input() clientId!: string;

  activities: Activity[] = [];

  displayedColumns: string[] = [
    'id',
    'date',
    'activityType',
    'uploadedFiles',
    'completedFiles',
    'failedFiles',
  ];
  expandedActivity: Activity | null = null;

  constructor(private activityService: CdClientActivityServiceService) {}

  ngOnInit(): void {
    this.fetchActivities();
  }

  fetchActivities(): void {
    this.activityService
      .getActivitiesByClientId(this.clientId)
      .subscribe((activities) => {
        this.activities = activities;
      });
  }

  headerMapping: { [key: string]: string } = {
    id: 'ID',
    activityType: 'Activity Type',
    description: 'Description',
    date: 'Date',
    uploadedFiles: 'Uploaded Files',
    completedFiles: 'Completed Files',
    failedFiles: 'Failed Files',
  };

  getHeader(column: string): string {
    return this.headerMapping[column] || column;
  }

  downloadFile(activity: Activity): void {
    this.activityService.downloadActivityFile(activity);
  }
}
