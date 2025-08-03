import { LiveAnnouncer } from '@angular/cdk/a11y';
import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import {
  MatFormFieldControl,
  MatFormFieldModule,
  MatLabel,
} from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator } from '@angular/material/paginator';
import {
  MatSelect,
  MatSelectChange,
  MatSelectModule,
} from '@angular/material/select';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { CdModeDirectiveDirective } from '../../cd-directives/cd-mode-directive/cd-mode-directive.directive';
import { CdTicketsServiceService } from '../../cd-services/cd-tickets-service/cd-tickets-service.service';

export interface CdTickets {
  ticket_id: string;
  created_by: string;
  cdassigned_to?: string;
  created_date: string;
  status: CdTicketStatus;
  priority: CdTicketPriority;
  description: string;
  resolution_note: string;
}

export enum CdTicketStatus {
  OPEN = 'Open',
  IN_PROGRESS = 'In Progress',
  CLOSED = 'Closed',
  RESOLVED = 'Resolved',
}

export enum CdTicketPriority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  CRITICAL = 'Critical',
}

const ELEMENT_DATA: CdTickets[] = [
  // {
  //   ticket_id: 'CD-TKT-001',
  //   created_by: 'Thomas Johnson',
  //   cdassigned_to: 'Support Team A',
  //   created_date: '2024-07-15',
  //   status: CdTicketStatus.OPEN,
  //   priority: CdTicketPriority.HIGH,
  //   description: 'Issue with login functionality.',
  //   resolution_note: '',
  // },
  // {
  //   ticket_id: 'CD-TKT-002',
  //   created_by: 'Sarah Davis',
  //   cdassigned_to: 'Dev Team B',
  //   created_date: '2024-07-14',
  //   status: CdTicketStatus.IN_PROGRESS,
  //   priority: CdTicketPriority.MEDIUM,
  //   description: 'Request for a new feature.',
  //   resolution_note: '',
  // },
  // {
  //   ticket_id: 'CD-TKT-003',
  //   created_by: 'Robert Taylor',
  //   cdassigned_to: 'Support Team A',
  //   created_date: '2024-07-13',
  //   status: CdTicketStatus.RESOLVED,
  //   priority: CdTicketPriority.LOW,
  //   description: 'Minor UI issue on the profile page.',
  //   resolution_note: 'Provided link to internal wiki page.',
  // },
  // {
  //   ticket_id: 'CD-TKT-004',
  //   created_by: 'Patricia Garcia',
  //   cdassigned_to: 'Dev Team A',
  //   created_date: '2024-07-12',
  //   status: CdTicketStatus.CLOSED,
  //   priority: CdTicketPriority.CRITICAL,
  //   description: 'Problem with report generation.',
  //   resolution_note: 'Hotfix applied and rollback procedure updated.',
  // },
  // {
  //   ticket_id: 'CD-TKT-005',
  //   created_by: 'Michael Brown',
  //   cdassigned_to: 'Support Team B',
  //   created_date: '2024-07-11',
  //   status: CdTicketStatus.OPEN,
  //   priority: CdTicketPriority.MEDIUM,
  //   description: 'Slow performance when viewing deployment history.',
  //   resolution_note: '',
  // },
  // {
  //   ticket_id: 'CD-TKT-006',
  //   created_by: 'Thomas Johnson',
  //   cdassigned_to: 'Dev Team B',
  //   created_date: '2024-07-10',
  //   status: CdTicketStatus.IN_PROGRESS,
  //   priority: CdTicketPriority.LOW,
  //   description: 'Inquiry about API documentation.',
  //   resolution_note: '',
  // },
  // {
  //   ticket_id: 'CD-TKT-007',
  //   created_by: 'Sarah Davis',
  //   cdassigned_to: 'Support Team A',
  //   created_date: '2024-07-09',
  //   status: CdTicketStatus.RESOLVED,
  //   priority: CdTicketPriority.HIGH,
  //   description: 'Issue with email notifications.',
  //   resolution_note: 'Configuration updated and verified.',
  // },
];

@Component({
  selector: 'app-cd-ticket-table-component',
  imports: [
    MatButtonModule,
    MatSortModule,
    MatOptionModule,
    MatIconModule,
    MatPaginator,
    MatTableModule,
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTooltipModule,
    FormsModule,
    CdModeDirectiveDirective,
  ],
  templateUrl: './cd-ticket-table-component.component.html',
  styleUrl: './cd-ticket-table-component.component.scss',
})
export class CdTicketTableComponentComponent implements AfterViewInit, OnInit {
  @ViewChild('prioritySelect')
  prioritySelectRef!: ElementRef<HTMLSelectElement>;
  @ViewChild('assignedToSelect')
  assignedToSelectRef!: ElementRef<HTMLSelectElement>;
  @ViewChild('createdBySelect')
  createdBySelectRef!: ElementRef<HTMLSelectElement>;
  @ViewChild('searchInput') searchInputRef!: ElementRef<HTMLInputElement>;

  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef,
    private ticketService: CdTicketsServiceService
  ) {}

  navigateToTicket(ticketId: string) {
    this.router.navigate(['cd-home/cd-support/view-ticket'], {
      queryParams: { id: ticketId },
    });
  }

  private _liveAnnouncer = inject(LiveAnnouncer);
  displayedColumns: string[] = [
    'ticket_id',
    'description',
    'priority',
    'status',
    'created_by',
    'cdassigned_to',
    'created_date',
  ];

  // allTickets: CdTickets[] = ELEMENT_DATA;
  dataSource = new MatTableDataSource<CdTickets>();

  pageSizeOptions: number[] = [5, 10, 15];
  pageSize: number = 5;
  statusFilter: string = '';
  priorityFilter: string = '';
  searchFilter: string = '';
  assignedToList: string[] = [];
  assignedToFilter: string = '';
  createdByList: string[] = [];
  createdByFilter: string = '';

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('statusSelect') statusSelect?: ElementRef<HTMLSelectElement>;
  @ViewChild('prioritySelect') prioritySelect?: ElementRef<HTMLSelectElement>;
  @ViewChild('assignedToSelect')
  assignedToSelect?: ElementRef<HTMLSelectElement>;
  @ViewChild('createdBySelect') createdBySelect?: ElementRef<HTMLSelectElement>;
  @ViewChild('searchInput') searchInput?: ElementRef<HTMLInputElement>;

  ngOnInit(): void {
    // Let afterViewInit handle paginator + data binding together
  }

  ngAfterViewInit(): void {
    // Assign paginator and sort
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    // Assign filter predicate
    this.dataSource.filterPredicate = this.createFilter();

    // Now trigger data setup only when paginator is ready
    this.ticketService.tickets$.subscribe((tickets) => {
      this.dataSource.data = tickets;

      // Update dropdown filters
      this.createdByList = [
        ...new Set(
          tickets.map((t) => t.created_by).filter((v): v is string => !!v)
        ),
      ];
      this.assignedToList = [
        ...new Set(
          tickets.map((t) => t.cdassigned_to).filter((v): v is string => !!v)
        ),
      ];

      this.applyCombinedFilter();

      // Force paginator to reset AFTER data is bound
      Promise.resolve().then(() => {
        this.dataSource.paginator = this.paginator;
        this.dataSource.paginator.firstPage();
      });

      this.cdr.detectChanges();
    });
  }

  StatusFilter(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    this.statusFilter = selectElement.value || '';
    this.applyCombinedFilter();
  }

  filterByStatus(status: string) {
    this.statusFilter = status;
    this.applyCombinedFilter();
  }

  getCountByStatus(status: string): number {
    return this.dataSource.filteredData.filter((t) => t.status === status)
      .length;
  }

  getCountByClosedGroup(): number {
    return this.dataSource.filteredData.filter(
      (t) =>
        t.status === CdTicketStatus.CLOSED ||
        t.status === CdTicketStatus.RESOLVED
    ).length;
  }

  applyPriorityFilter(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    this.priorityFilter = selectElement.value || '';
    this.applyCombinedFilter();
  }

  applyAssignedToFilter(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    this.assignedToFilter = selectElement.value || '';
    this.applyCombinedFilter();
  }

  applyCreatedByFilter(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    this.createdByFilter = selectElement.value || '';
    this.applyCombinedFilter();
  }

  createFilter(): (data: CdTickets, filter: string) => boolean {
    return (data: CdTickets, filter: string): boolean => {
      const filterObj = JSON.parse(filter);
      const searchTerms = filterObj.search
        .split(' ')
        .filter((term: string) => term);
      const statusFilter = filterObj.status;
      const priorityFilter = filterObj.priority;
      const assignedToFilter = filterObj.cdassigned_to;
      const createdByFilter = filterObj.createdBy;

      let searchMatch = true;
      if (searchTerms.length > 0) {
        const dataStr = `${data.ticket_id} ${data.created_by} ${
          data.cdassigned_to || ''
        } ${data.created_date} ${data.description} ${data.priority} ${
          data.status
        }`.toLowerCase();
        searchMatch = searchTerms.every((term: string) =>
          dataStr.includes(term)
        );
      }

      let statusMatch = true;
      if (statusFilter === 'closed_group') {
        statusMatch =
          data.status === CdTicketStatus.CLOSED ||
          data.status === CdTicketStatus.RESOLVED;
      } else if (statusFilter) {
        statusMatch = data.status === statusFilter;
      }

      let priorityMatch = true;
      if (priorityFilter) {
        priorityMatch = data.priority === priorityFilter;
      }

      let assignedToMatch = true;
      if (assignedToFilter) {
        assignedToMatch = data.cdassigned_to === assignedToFilter;
      }

      let createdByMatch = true;
      if (createdByFilter) {
        createdByMatch = data.created_by === createdByFilter;
      }

      return (
        searchMatch &&
        statusMatch &&
        priorityMatch &&
        assignedToMatch &&
        createdByMatch
      );
    };
  }

  applyFilter(event: Event) {
    this.searchFilter = (event.target as HTMLInputElement).value
      .trim()
      .toLowerCase();
    this.applyCombinedFilter();
  }

  applyCombinedFilter() {
    this.dataSource.filter = JSON.stringify({
      search: this.searchFilter,
      status: this.statusFilter,
      priority: this.priorityFilter,
      cdassigned_to: this.assignedToFilter,
      createdBy: this.createdByFilter,
    });

    // ✅ Reset paginator safely
    if (this.dataSource.paginator) {
      setTimeout(() => this.dataSource.paginator?.firstPage());
    }
  }

  announceSortChange(sortState: Sort) {
    if (this.sort.direction) {
      this._liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
    } else {
      this._liveAnnouncer.announce('Sorting cleared');
    }
  }

  onPageSizeChange(event: any) {
    this.pageSize = event.value;
    this.dataSource.paginator?.firstPage();
  }

  resetFilters() {
    this.statusFilter = '';
    this.priorityFilter = '';
    this.searchFilter = '';
    this.assignedToFilter = '';
    this.createdByFilter = '';

    if (this.searchInputRef?.nativeElement) {
      this.searchInputRef.nativeElement.value = '';
    }

    if (this.prioritySelectRef?.nativeElement) {
      this.prioritySelectRef.nativeElement.value = '';
    }

    if (this.assignedToSelectRef?.nativeElement) {
      this.assignedToSelectRef.nativeElement.value = '';
    }

    if (this.createdBySelectRef?.nativeElement) {
      this.createdBySelectRef.nativeElement.value = '';
    }

    this.applyCombinedFilter();
  }
}
