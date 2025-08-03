import { Component } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatSnackBar } from "@angular/material/snack-bar";
import { MatTableDataSource, MatTableModule } from "@angular/material/table";
import { CommonModule } from "@angular/common";
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from "@angular/animations";
import { CcdModeDirective } from "../../ccd-directives/ccd-mode-directive/ccd-mode-directive.directive";
import { CcdModeChangeServiceService } from '../../ccd-services/ccd-mode-change-service/ccd-mode-change-service.service';


export interface fileDetail {
  fileName: string;
  fileType: "csv" | "pdf";
  uploadedDate: string;
  expiryDate: string;
}

export interface UploadRecord {
  id: string;
  startDate: string;
  endDate: string;
  totalFiles: string;
  uploadedBy: string;
  files: fileDetail[];
}

export const UPLOAD_RECORDS: UploadRecord[] = [
  {
    id: "REC-20240301-001",
    startDate: "2024-03-01T09:00:00Z",
    endDate: "2025-03-01T09:00:00Z",
    totalFiles: "3",
    uploadedBy: "USER456",
    files: [
      {
        fileName: "sales_report_march.csv",
        fileType: "csv",
        uploadedDate: "2024-03-01T10:15:00Z",
        expiryDate: "2025-03-01T10:15:00Z",
      },
      {
        fileName: "contract_details.pdf",
        fileType: "pdf",
        uploadedDate: "2024-03-01T10:20:00Z",
        expiryDate: "2025-03-01T10:20:00Z",
      },
      {
        fileName: "inventory_list.csv",
        fileType: "csv",
        uploadedDate: "2024-03-01T10:25:00Z",
        expiryDate: "2025-03-01T10:25:00Z",
      },
    ],
  },
  {
    id: "REC-20240302-001",
    startDate: "2024-03-02T08:30:00Z",
    endDate: "2025-03-02T08:30:00Z",
    totalFiles: "2",
    uploadedBy: "USER456",
    files: [
      {
        fileName: "employee_records.pdf",
        fileType: "pdf",
        uploadedDate: "2024-03-02T09:45:00Z",
        expiryDate: "2025-03-02T09:45:00Z",
      },
      {
        fileName: "attendance_march.csv",
        fileType: "csv",
        uploadedDate: "2024-03-02T09:50:00Z",
        expiryDate: "2025-03-02T09:50:00Z",
      },
    ],
  },
];

@Component({
  selector: "app-ccd-old-activity",
  imports: [MatTableModule, MatButtonModule, MatIconModule, CommonModule, CcdModeDirective],
  templateUrl: "./ccd-old-activity.component.html",
  styleUrl: "./ccd-old-activity.component.scss",
  animations: [
    trigger("detailExpand", [
      state("collapsed", style({ height: "0px", minHeight: "0" })),
      state("expanded", style({ height: "*" })),
      transition(
        "expanded <=> collapsed",
        animate("225ms cubic-bezier(0.4, 0.0, 0.2, 1)")
      ),
    ]),
  ],
})
export class CcdOldActivityComponent {
  displayedColumns: string[] = [
    "id",
    "startDate",
    "endDate",
    "totalFiles",
    "uploadedBy",
    "action",
  ];

  headerMapping: { [key: string]: string } = {
    id: "ID",
    startDate: "Start Date",
    endDate: "End Date",
    totalFiles: "Total Files",
    uploadedBy: "Uploaded By",
    action: "Actions",
  };

  constructor(private snackBar: MatSnackBar, private themeService: CcdModeChangeServiceService) {}

  getHeader(column: string): string {
    return this.headerMapping[column] || column;
  }

  downloadZip(record: UploadRecord): void {
    // Show snackbar notification
    this.snackBar.open("Download started", "Close", {
      duration: 3000,
      horizontalPosition: "center",
      verticalPosition: "top",
    });

    // Log with format similar to reference
    console.log(`Downloading file for activity ${record.id}`);
  }

  downloadFile(file: fileDetail): void {
    // Show snackbar notification
    this.snackBar.open("Download started", "Close", {
      duration: 3000,
      horizontalPosition: "center",
      verticalPosition: "top",
    });

    // Log with format similar to reference
    console.log(`Downloading file ${file.fileName}`);
  }

  expandedElement: UploadRecord | null = null;

  dataSource = new MatTableDataSource<UploadRecord>(UPLOAD_RECORDS);
}
