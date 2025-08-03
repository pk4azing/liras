import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, OnDestroy, OnInit, Renderer2, ViewChild, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { filter } from 'rxjs';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { MatButton, MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { CcdTitleServiceService } from '../../ccd-services/ccd-title-service/ccd-title-service.service';
import { CcdModeChangeServiceService } from '../../ccd-services/ccd-mode-change-service/ccd-mode-change-service.service';
import { CcdProfileDataServiceService, UserProfile } from '../../ccd-services/ccd-profile-data-service/ccd-profile-data-service.service';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { CcdEventsServiceService } from '../../ccd-services/ccd-events-service/ccd-events-service.service';
import { ActivityCard, CcdActivityDataServiceService } from '../../ccd-services/ccd-activity-data-service/ccd-activity-data-service.service';



export interface CCDNotificationItem {
  id: string;
  username: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  messageType: 'created' | 'closed';
}


@Component({
  selector: 'app-ccd-home',
  imports: [RouterOutlet,
    RouterLink,
    CommonModule,
    NgbDropdownModule,
    MatIconModule,
    MatBadgeModule,
    MatMenuModule,
    MatButtonModule,
    MatDividerModule,
    FullCalendarModule],
  providers: [CcdModeChangeServiceService],
  templateUrl: './ccd-home.component.html',
  styleUrls: ['./ccd-home.component.scss',
    '../../../styles/style.min.css',
    '../../../styles/fullcalender.min.css',
    // '../../../styles/custom_forms.scss',
  ],
  encapsulation: ViewEncapsulation.None
})
export class CcdHomeComponent implements OnInit {
  loggedInUsername: string | null = null;
  user!: UserProfile;
  isDashboardRoute: boolean = false;
  isOffcanvasActive = false;
  isThemeDivOpen = false;
  isSideNavItemGird = false;
  isHomeRoute: boolean = false;
  isNavbarFixed: boolean = false;
  isHeaderDark: boolean = false;
  isMinSidebarDark: boolean = false;
  isSidebarDark: boolean = false;
  isIconColor: boolean = false;
  isGradientColor: boolean = false;
  homeTitle: string = 'Home';
  newHomeTitle: string = 'Home';
  isRightbarOpen = false;
  selectedMode: string = 'light';
  deletingItemId: string | null = null;
  clearingAll: boolean = false;
  horizontalPosition: MatSnackBarHorizontalPosition = 'center';
  verticalPosition: MatSnackBarVerticalPosition = 'top';
  isDropdownVisible: boolean = false;
  selectedFont: string = 'font-muli';
  modes = [{ name: 'light' }, { name: 'dark' }];
  @ViewChild('ofca', { static: true }) ofcaRef!: ElementRef;
  @ViewChild('ofca') ofca!: ElementRef;
  @ViewChild('pageTop', { static: true }) pageTopRef!: ElementRef;
  @ViewChild('headerTop', { static: true }) headerTopRef!: ElementRef;

  calendarOptions: CalendarOptions = {
    initialView: 'dayGridMonth',
    plugins: [dayGridPlugin, interactionPlugin],
    events: [
      // { title: 'Creation Event', date: '2025-06-16' },
      // { title: 'Creation Event', date: '2025-06-17' }
    ]
  };

  events: any[] = [];
  activityCards: ActivityCard[] = [];


  themes = [
    { name: 'azure', color: '#45aaf2', displayName: 'Azure' },
    { name: 'indigo', color: '#6435c9', displayName: 'Indigo' },
    { name: 'purple', color: '#a333c8', displayName: 'Purple' },
    { name: 'orange', color: '#f2711c', displayName: 'Orange' },
    { name: 'green', color: '#21ba45', displayName: 'Green' },
    { name: 'cyan', color: '#17a2b8', displayName: 'Cyan' },
    { name: 'blush', color: '#de5d83', displayName: 'Blush' }
  ];

  selectedTheme = 'blush';

  notifications: CCDNotificationItem[] = [
    {
      id: '1',
      message: 'has created a ticket',
      timestamp: '1 hr ago',
      isRead: true,
      messageType: 'created',
      username: 'Randy',
    },
    {
      id: '2',
      message: 'has created a ticket',
      timestamp: '30 mins ago',
      isRead: false,
      messageType: 'created',
      username: 'Josh',
    },
    {
      id: '3',
      message: 'has closed a ticket',
      timestamp: '2 hrs ago',
      isRead: true,
      messageType: 'closed',
      username: 'Alice',
    },
    {
      id: '4',
      message: 'has closed a ticket',
      timestamp: '15 mins ago',
      isRead: false,
      messageType: 'closed',
      username: 'Bob',
    },
  ];



  constructor(public router: Router,
    private route: ActivatedRoute,
    private renderer: Renderer2,
    private snackBar: MatSnackBar,
    private titleService: CcdTitleServiceService,
    private themeService: CcdModeChangeServiceService,
    private userService: CcdProfileDataServiceService,
    private eventsService: CcdEventsServiceService,
    private activityDataService: CcdActivityDataServiceService
  ) { }

  ngOnInit(): void {
    this.loggedInUsername = localStorage.getItem('username');
    this.user = this.userService.getUserProfile();
    this.calendarOptions.events = this.eventsService.getCalendarEvents();
    this.events = this.eventsService.getListEvents();
    this.activityCards = this.activityDataService.getActivityCards();
    this.checkRoute();

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.checkRoute();
      });

    this.titleService.currentHomeTitle.subscribe(title => {
      this.newHomeTitle = title;
    });

    const storedFont = localStorage.getItem('selectedFont');
    this.selectedFont = storedFont ? storedFont : 'font-muli';


    const savedIconColor = localStorage.getItem('isIconColor');
    this.isIconColor = savedIconColor === 'true';
    if (this.isIconColor) {
      this.renderer.addClass(this.ofcaRef.nativeElement, 'iconcolor');
    } else {
      this.renderer.removeClass(this.ofcaRef.nativeElement, 'iconcolor');
    }

    const savedGradientColor = localStorage.getItem('isGradientColor');
    this.isGradientColor = savedGradientColor === 'true';
    if (this.isGradientColor) {
      this.renderer.addClass(this.ofcaRef.nativeElement, 'gradient');
    } else {
      this.renderer.removeClass(this.ofcaRef.nativeElement, 'gradient');
    }

    const savedSidebarDark = localStorage.getItem('isSidebarDark');
    this.isSidebarDark = savedSidebarDark === 'true';

    // Apply the class based on saved state
    if (this.isSidebarDark) {
      this.renderer.addClass(this.ofcaRef.nativeElement, 'sidebar_dark');
    } else {
      this.renderer.removeClass(this.ofcaRef.nativeElement, 'sidebar_dark');
    }


    const savedMinSidebarDark = localStorage.getItem('isMinSidebarDark');
    this.isMinSidebarDark = savedMinSidebarDark === 'true';

    if (this.isMinSidebarDark) {
      this.renderer.addClass(this.headerTopRef.nativeElement, 'dark');
    }

    const savedHeaderDark = localStorage.getItem('isHeaderDark');
    this.isHeaderDark = savedHeaderDark === 'true';

    // Apply the class if needed
    if (this.isHeaderDark) {
      this.renderer.addClass(this.pageTopRef.nativeElement, 'top_dark');
    }

    const savedValue = localStorage.getItem('isNavbarFixed');
    this.isNavbarFixed = savedValue === 'true';

    if (this.isNavbarFixed) {
      this.renderer.addClass(this.pageTopRef.nativeElement, 'sticky-top');
    }

    const savedMode = localStorage.getItem('selectedMode');
    if (savedMode && this.modes.some(t => t.name === savedMode)) {
      this.selectedMode = savedMode;
      this.applyMode(savedMode as 'light' | 'dark'); // Apply saved mode
    } else {
      this.applyMode('light'); // Apply default mode if none saved
    }

    const savedTheme = localStorage.getItem('selectedTheme');
    if (savedTheme && this.themes.some(t => t.name === savedTheme)) {
      this.selectedTheme = savedTheme;
    }

    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.updateHomeTitle();
        this.isHomeRoute = this.checkHomeRoute();
      });
    this.updateHomeTitle();
    this.isHomeRoute = this.checkHomeRoute();
  }

  private checkRoute() {
    this.isDashboardRoute = this.router.url === '/ccd-home';
  }



  toggleOffcanvas() {
    this.isOffcanvasActive = !this.isOffcanvasActive;
  }

  toggleThemeDiv() {
    this.isThemeDivOpen = !this.isThemeDivOpen;
  }

  toggleRightbar() {
    this.isRightbarOpen = !this.isRightbarOpen;
  }

  toggleSideNavItemGird() {
    this.isSideNavItemGird = !this.isSideNavItemGird;
  }

  getTitleFromRoute(route: string): string {
    const titles: { [key: string]: string } = {
      'ccd-activity': 'Activity',
      'ccd-settings': 'Settings',
      'ccd-404': '404',
      'ccd-help': 'Help',
    };
    return titles[route.toLowerCase()] || 'Home';
  }

  private checkHomeRoute(): boolean {
    const currentUrl = this.router.url;
    return currentUrl === '/ccd-home';
  }

  private updateHomeTitle() {
    let currentRoute = this.route.snapshot;
    while (currentRoute.firstChild) {
      currentRoute = currentRoute.firstChild;
    }

    if (currentRoute.data['title']) {
      this.homeTitle = currentRoute.data['title'];
      this.titleService.updateHomeTitle(this.homeTitle);
    } else {
      const segments = this.router.url.split('/').filter(segment => segment);
      if (segments.length > 0) {
        const lastSegment = segments[segments.length - 1];
        this.homeTitle = this.getTitleFromRoute(lastSegment);
      } else {
        this.homeTitle = 'Home';
      }
      this.titleService.updateHomeTitle(this.homeTitle);
    }
  }

  applyMode(mode: 'light' | 'dark'): void {
    const ofcaEl = this.ofcaRef.nativeElement as HTMLElement;

    // Remove existing mode class
    ofcaEl.classList.remove('dark-mode');

    // Add class based on selected mode
    if (mode === 'dark') {
      ofcaEl.classList.add('dark-mode');
    }

    // Save mode to localStorage
    localStorage.setItem('selectedMode', mode);
    this.selectedMode = mode; // Update component state
    this.isThemeDivOpen = false;
    this.themeService.setMode(mode);
  }

  onNightModeToggle(event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    const newMode: 'light' | 'dark' = isChecked ? 'dark' : 'light';
    this.applyMode(newMode);
  }

  onNavbarFixedToggle(event: Event): void {
    this.isNavbarFixed = (event.target as HTMLInputElement).checked;
    localStorage.setItem('isNavbarFixed', String(this.isNavbarFixed));

    if (this.isNavbarFixed) {
      this.renderer.addClass(this.pageTopRef.nativeElement, 'sticky-top');
    } else {
      this.renderer.removeClass(this.pageTopRef.nativeElement, 'sticky-top');
    }
  }

  onHeaderDarkToggle(event: Event): void {
    this.isHeaderDark = (event.target as HTMLInputElement).checked;
    localStorage.setItem('isHeaderDark', String(this.isHeaderDark));

    if (this.isHeaderDark) {
      this.renderer.addClass(this.pageTopRef.nativeElement, 'top_dark');
    } else {
      this.renderer.removeClass(this.pageTopRef.nativeElement, 'top_dark');
    }
  }

  onMinSidebarDarkToggle(event: Event): void {
    this.isMinSidebarDark = (event.target as HTMLInputElement).checked;
    localStorage.setItem('isMinSidebarDark', String(this.isMinSidebarDark));
    if (this.isMinSidebarDark) {
      this.renderer.addClass(this.headerTopRef.nativeElement, 'dark');
    } else {
      this.renderer.removeClass(this.headerTopRef.nativeElement, 'dark');
    }
  }

  onSidebarDarkToggle(event: Event): void {
    // Update the state from checkbox
    this.isSidebarDark = (event.target as HTMLInputElement).checked;

    // Save to localStorage
    localStorage.setItem('isSidebarDark', String(this.isSidebarDark));

    // Toggle the class
    if (this.isSidebarDark) {
      this.renderer.addClass(this.ofca.nativeElement, 'sidebar_dark');
    } else {
      this.renderer.removeClass(this.ofca.nativeElement, 'sidebar_dark');
    }
  }

  onIconColorToggle(event: Event): void {
    this.isIconColor = (event.target as HTMLInputElement).checked;
    localStorage.setItem('isIconColor', String(this.isIconColor));
    if (this.isIconColor) {
      this.renderer.addClass(this.ofcaRef.nativeElement, 'iconcolor');
    } else {
      this.renderer.removeClass(this.ofcaRef.nativeElement, 'iconcolor');
    }
  }

  onGradientColorToggle(event: Event): void {
    this.isGradientColor = (event.target as HTMLInputElement).checked;
    localStorage.setItem('isGradientColor', String(this.isGradientColor));
    if (this.isGradientColor) {
      this.renderer.addClass(this.ofcaRef.nativeElement, 'gradient');
    } else {
      this.renderer.removeClass(this.ofcaRef.nativeElement, 'gradient');
    }
  }

  selectTheme(theme: { name: string, color: string }) {
    this.selectedTheme = theme.name;

    // Save to localStorage
    localStorage.setItem('selectedTheme', this.selectedTheme);

    // Update DOM class (alternative approach - ngClass handles this automatically)
    const element = this.ofca.nativeElement;
    this.themes.forEach(t => {
      element.classList.remove(`theme-${t.name}`);
    });
    element.classList.add(`theme-${this.selectedTheme}`);
  }

  // notification function
  onDeleteNotification(id: string): void {
    this.deletingItemId = id;
    const deletedNotification = this.notifications.find(
      (notification) => notification.id === id
    );

    // Wait for the animation to finish before actually removing from the array
    setTimeout(() => {
      this.notifications = this.notifications.filter(
        (notification) => notification.id !== id
      );
      this.deletingItemId = null; // Reset deleting state
      this.openSnackBar(`Notification successfully deleted`);
    }, 500); // Adjust the timeout to match the animation duration

    console.log('Initiating delete animation for:', id);
    // In a real application, you would likely call a service to delete the notification.
  }

  markAsRead(notification: CCDNotificationItem): void {
    console.log(
      'Before markAsRead:',
      JSON.parse(JSON.stringify(this.notifications))
    );
    const index = this.notifications.findIndex((n) => n.id === notification.id);
    if (index > -1) {
      this.notifications[index].isRead = true;
      console.log(
        'After markAsRead:',
        JSON.parse(JSON.stringify(this.notifications))
      );
    }
  }

  toggleNotificationDropdown(): void {
    console.log('toggleDropdown');
    this.isDropdownVisible = !this.isDropdownVisible;
  }



  onNotificationClick(notification: CCDNotificationItem): void {
    console.log(
      'Notification clicked:',
      notification.id,
      'isRead:',
      notification.isRead
    );
    if (!notification.isRead) {
      this.markAsRead(notification);
    }
    // Add any additional navigation logic here if needed
  }
  get unreadCount(): number {
    return this.notifications.filter((notification) => !notification.isRead)
      .length;
  }

  clearAllNotifications(event: Event): void {
    event.stopPropagation();
    this.clearingAll = true; // New property to track clearing state
    setTimeout(() => {
      this.notifications = [];
      this.clearingAll = false; // Reset clearing state
      this.openSnackBar('All notifications cleared');
      console.log('All notifications cleared');
    }, 500); // Adjust timeout to match animation duration
  }

  openSnackBar(message: string): void {
    this.snackBar.open(message, 'Dismiss', {
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
      duration: 3000, // Optional: Duration in milliseconds to show the snackbar
    });
  }

  onFontChange(font: string): void {
    this.selectedFont = font;
    localStorage.setItem('selectedFont', font);
  }

  get selectedThemeColor(): string {
    return this.themes.find(t => t.name === this.selectedTheme)?.color || '#45aaf2';
  }

}
