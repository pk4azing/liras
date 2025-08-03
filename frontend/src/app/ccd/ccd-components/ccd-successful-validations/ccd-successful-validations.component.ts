import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, Input, SimpleChanges, ViewChild, OnChanges, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';



export interface ccdSuccessTable {
  activityId: string;
  uploadedDate: string;
  expiryDate: string;
  fileName: string;
}


@Component({
  selector: 'app-ccd-successful-validations',
  imports: [MatTableModule, MatPaginatorModule, MatSortModule, MatButtonModule, CommonModule, MatIconModule],
  templateUrl: './ccd-successful-validations.component.html',
  styleUrls: ['./ccd-successful-validations.component.scss',
    '../../../styles/style.min.css',
  ],

})
export class CcdSuccessfulValidationsComponent implements OnChanges, AfterViewInit {
  @Input() successfulFiles: ccdSuccessTable[] = [];
  

  displayedColumns: string[] = [
    'activityId',
    'fileName',
    'uploadedDate',
    'expiryDate',
  ];
  dataSource = new MatTableDataSource<ccdSuccessTable>([]);

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;


  ngOnChanges(changes: SimpleChanges) {
    if (changes['successfulFiles']) {
      this.updateDataSource();
    }
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }
  
  private updateDataSource() {
    // Create a new reference of the array to ensure change detection
    this.dataSource.data = [...this.successfulFiles];

    // If you have pagination, reset it
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  // Add trackBy for better performance
  trackByActivityId(index: number, item: ccdSuccessTable): string {
    return item.activityId;
  }


}
