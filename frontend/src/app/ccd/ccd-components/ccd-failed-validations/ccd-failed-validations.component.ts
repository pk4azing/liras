import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, SimpleChanges, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatTable, MatTableDataSource, MatTableModule } from '@angular/material/table';

interface ccdFailTable {
  activityId: string;
  uploadedDate: string;
  fileName: string;
  failReason: string;
}


@Component({
  selector: 'app-ccd-failed-validations',
  imports: [MatIcon, MatTableModule, MatButtonModule, CommonModule],
  templateUrl: './ccd-failed-validations.component.html',
  styleUrl: './ccd-failed-validations.component.scss',
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition(
        'expanded <=> collapsed',
        animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')
      ),
    ]),
  ],
})
export class CcdFailedValidationsComponent {
  @Input() failedFiles: ccdFailTable[] = [];
  @Output() retryUpload = new EventEmitter<void>();

  displayedColumns: string[] = [
    'activityId',
    'fileName',
    'uploadedDate',
    'action',
  ];

  headerMapping: { [key: string]: string } = {
    activityId: 'Activity ID',
    uploadedDate: 'Uploaded Date',
    fileName: 'File Name',
    action: 'Action',
  };

  expandedElement: ccdFailTable | null = null;

  dataSource = new MatTableDataSource<ccdFailTable>([]);

  @ViewChild(MatTable) table!: MatTable<any>;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['failedFiles']) {
      this.dataSource.data = [...this.failedFiles]; // important to spread
      if (this.table) {
        this.table.renderRows(); // important to refresh
      }
    }
  }

  getHeader(column: string): string {
    return this.headerMapping[column] || column;
  }

  handleRetryClick(): void {
    this.retryUpload.emit();
  }
}
