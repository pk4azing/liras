import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  OnInit,
  Renderer2,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {
  MatSnackBar,
  MatSnackBarHorizontalPosition,
  MatSnackBarVerticalPosition,
} from '@angular/material/snack-bar';
import {
  ActivatedRoute,
  NavigationEnd,
  Router,
  RouterLink,
  RouterOutlet,
} from '@angular/router';
import { CdModeChangeServiceService } from '../../cd-services/cd-mode-change-service/cd-mode-change-service.service';
import { filter } from 'rxjs';
import { MatBadgeModule } from '@angular/material/badge';
import {
  UserProfile,
  CdProfileDataServiceService,
} from '../../cd-services/cd-profile-data-service/cd-profile-data-service.service';
import { CdTitleServiceService } from '../../cd-services/cd-title-service/cd-title-service.service';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { CdEventsServiceService } from '../../cd-services/cd-events-service/cd-events-service.service';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { CdModeDirectiveDirective } from '../../cd-directives/cd-mode-directive/cd-mode-directive.directive';
import { LoadingSpinnerServiceService } from '../../../common/services/loading-spinner-service/loading-spinner-service.service';
import { LoadingSpinnerComponentComponent } from '../../../common/components/loading-spinner-component/loading-spinner-component.component';

export interface CDNotificationItem {
  id: string;
  username: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  messageType: 'created' | 'closed';
}

@Component({
  selector: 'app-cd-home',
  imports: [
    CommonModule,
    RouterLink,
    RouterOutlet,
    MatBadgeModule,
    FullCalendarModule,
    NgbDropdownModule,
    LoadingSpinnerComponentComponent,
  ],
  templateUrl: './cd-home.component.html',
  providers: [CdModeChangeServiceService],
  styleUrls: [
    './cd-home.component.scss',
    '../../../styles/style.min.css',
    '../../../styles/fullcalender.min.css',
  ],
  encapsulation: ViewEncapsulation.None,
})
export class CdHomeComponent implements OnInit {
  loggedInUsername: string | null = null;
  isOffcanvasActive = false;
  selectedFont: string = 'font-muli';
  selectedTheme = 'blush';
  isRightbarOpen = false;
  selectedMode: string = 'light';
  isThemeDivOpen = false;
  isNavbarFixed: boolean = false;
  isHeaderDark: boolean = false;
  isDashboardRoute: boolean = false;
  isMinSidebarDark: boolean = false;
  isSidebarDark: boolean = false;
  isIconColor: boolean = false;
  isGradientColor: boolean = false;
  isSideNavItemGird = false;
  isDropdownVisible: boolean = false;
  deletingItemId: string | null = null;
  clearingAll: boolean = false;
  user!: UserProfile;
  homeTitle: string = 'Home';
  newHomeTitle: string = 'Home';
  isHomeRoute: boolean = false;
  horizontalPosition: MatSnackBarHorizontalPosition = 'center';
  verticalPosition: MatSnackBarVerticalPosition = 'top';
  @ViewChild('pageTop', { static: true }) pageTopRef!: ElementRef;
  @ViewChild('ofca', { static: true }) ofcaRef!: ElementRef;
  @ViewChild('ofca') ofca!: ElementRef;
  @ViewChild('headerTop', { static: true }) headerTopRef!: ElementRef;

  themes = [
    { name: 'azure', color: '#45aaf2', displayName: 'Azure' },
    { name: 'indigo', color: '#6435c9', displayName: 'Indigo' },
    { name: 'purple', color: '#a333c8', displayName: 'Purple' },
    { name: 'orange', color: '#f2711c', displayName: 'Orange' },
    { name: 'green', color: '#21ba45', displayName: 'Green' },
    { name: 'cyan', color: '#17a2b8', displayName: 'Cyan' },
    { name: 'blush', color: '#de5d83', displayName: 'Blush' },
  ];
  modes = [{ name: 'light' }, { name: 'dark' }];

  notifications: CDNotificationItem[] = [
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

  calendarOptions: CalendarOptions = {
    initialView: 'dayGridMonth',
    plugins: [dayGridPlugin, interactionPlugin],
    events: [
      // { title: 'Creation Event', date: '2025-06-16' },
      // { title: 'Creation Event', date: '2025-06-17' }
    ],
  };
  events: any[] = [];

  constructor(
    public router: Router,
    private route: ActivatedRoute,
    private renderer: Renderer2,
    private snackBar: MatSnackBar,
    private themeService: CdModeChangeServiceService,
    private userService: CdProfileDataServiceService,
    private titleService: CdTitleServiceService,
    private eventsService: CdEventsServiceService
  ) {}

  ngOnInit(): void {
    this.loggedInUsername = localStorage.getItem('username');
    this.checkRoute();
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.checkRoute();
      });

    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.updateHomeTitle();
        this.isHomeRoute = this.checkHomeRoute();
      });
    this.updateHomeTitle();
    this.isHomeRoute = this.checkHomeRoute();

    this.user = this.userService.getUserProfile();

    this.titleService.currentHomeTitle.subscribe((title) => {
      this.newHomeTitle = title;
    });

    this.calendarOptions.events = this.eventsService.getCalendarEvents();
    this.events = this.eventsService.getListEvents();

    const storedFont = localStorage.getItem('selectedFont');
    this.selectedFont = storedFont ? storedFont : 'font-muli';

    const savedTheme = localStorage.getItem('selectedTheme');
    if (savedTheme && this.themes.some((t) => t.name === savedTheme)) {
      this.selectedTheme = savedTheme;
    }

    const savedMode = localStorage.getItem('selectedMode');
    if (savedMode && this.modes.some((t) => t.name === savedMode)) {
      this.selectedMode = savedMode;
      this.applyMode(savedMode as 'light' | 'dark'); // Apply saved mode
    } else {
      this.applyMode('light'); // Apply default mode if none saved
    }

    const savedValue = localStorage.getItem('isNavbarFixed');
    this.isNavbarFixed = savedValue === 'true';

    if (this.isNavbarFixed) {
      this.renderer.addClass(this.pageTopRef.nativeElement, 'sticky-top');
    }

    const savedHeaderDark = localStorage.getItem('isHeaderDark');
    this.isHeaderDark = savedHeaderDark === 'true';

    // Apply the class if needed
    if (this.isHeaderDark) {
      this.renderer.addClass(this.pageTopRef.nativeElement, 'top_dark');
    }

    const savedMinSidebarDark = localStorage.getItem('isMinSidebarDark');
    this.isMinSidebarDark = savedMinSidebarDark === 'true';

    if (this.isMinSidebarDark) {
      this.renderer.addClass(this.headerTopRef.nativeElement, 'dark');
    }

    const savedSidebarDark = localStorage.getItem('isSidebarDark');
    this.isSidebarDark = savedSidebarDark === 'true';

    // Apply the class based on saved state
    if (this.isSidebarDark) {
      this.renderer.addClass(this.ofcaRef.nativeElement, 'sidebar_dark');
    } else {
      this.renderer.removeClass(this.ofcaRef.nativeElement, 'sidebar_dark');
    }

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
  }

  private checkRoute() {
    this.isDashboardRoute = this.router.url === '/cd-home';
  }

  toggleOffcanvas() {
    this.isOffcanvasActive = !this.isOffcanvasActive;
  }

  onFontChange(font: string): void {
    this.selectedFont = font;
    localStorage.setItem('selectedFont', font);
  }

  toggleRightbar() {
    this.isRightbarOpen = !this.isRightbarOpen;
  }

  selectTheme(theme: { name: string; color: string }) {
    this.selectedTheme = theme.name;

    // Save to localStorage
    localStorage.setItem('selectedTheme', this.selectedTheme);

    // Update DOM class (alternative approach - ngClass handles this automatically)
    const element = this.ofca.nativeElement;
    this.themes.forEach((t) => {
      element.classList.remove(`theme-${t.name}`);
    });
    element.classList.add(`theme-${this.selectedTheme}`);
  }

  get selectedThemeColor(): string {
    return (
      this.themes.find((t) => t.name === this.selectedTheme)?.color || '#45aaf2'
    );
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

  toggleSideNavItemGird() {
    this.isSideNavItemGird = !this.isSideNavItemGird;
  }

  toggleNotificationDropdown(): void {
    console.log('toggleDropdown');
    this.isDropdownVisible = !this.isDropdownVisible;
  }

  get unreadCount(): number {
    return this.notifications.filter((notification) => !notification.isRead)
      .length;
  }

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

  markAsRead(notification: CDNotificationItem): void {
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

  private updateHomeTitle() {
    let currentRoute = this.route.snapshot;

    while (currentRoute.firstChild) {
      currentRoute = currentRoute.firstChild;
    }

    if (currentRoute.data['title']) {
      this.homeTitle = currentRoute.data['title'];
    } else {
      const segments = this.router.url.split('?')[0].split('/').filter(Boolean); // clean up the URL

      let matchedKey = '';

      if (segments.length >= 2) {
        // Try the last two segments
        matchedKey = `${segments[segments.length - 2]}/${
          segments[segments.length - 1]
        }`;
        this.homeTitle = this.getTitleFromRoute(matchedKey);

        if (this.homeTitle === 'Home') {
          // Try segment 1 + 2 like 'cd-support'
          matchedKey = segments.slice(1, 3).join('/');
          this.homeTitle = this.getTitleFromRoute(matchedKey);
        }
      } else if (segments.length === 1) {
        matchedKey = segments[0];
        this.homeTitle = this.getTitleFromRoute(matchedKey);
      } else {
        this.homeTitle = 'Home';
      }
    }

    this.titleService.updateHomeTitle(this.homeTitle);
  }

  private checkHomeRoute(): boolean {
    const currentUrl = this.router.url;
    return currentUrl === '/cd-home';
  }

  getTitleFromRoute(route: string): string {
    const titles: { [key: string]: string } = {
      'cd-home': 'Home',
      'cd-client-management': 'Client Management',
      'cd-profile-management': 'Profile Management',
      'cd-role-management': 'Role Management',
      'cd-user-management': 'User Management',
      'cd-support': 'Tickets',
      'cd-support/view-ticket': 'View Ticket',
    };
    return titles[route.toLowerCase()] || 'Home';
  }
}
