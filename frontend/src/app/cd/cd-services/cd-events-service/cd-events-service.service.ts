import { Injectable } from '@angular/core';
import { EventInput } from '@fullcalendar/core';


@Injectable({
  providedIn: 'root'
})
export class CdEventsServiceService {

  private events: EventInput[] = [
    {title: 'Report Generated', date: '2025-06-16', className: 'bg-success'},
    // {title: 'Creation Event', date: '2025-06-17', className: 'bg-info'},
    // {title: 'Creation Event', date: '2025-06-18', className: 'bg-success'},
    // {title: 'Creation Event', date: '2025-06-19', className: 'bg-warning'},
    {title: 'Report Expiry', date: '2025-06-20', className: 'bg-danger'},
  ]

  constructor() { }

  getCalendarEvents(): EventInput[] {
    return this.events;
  }

  getListEvents(): EventInput[] {
    return this.events.map(event => ({
      title: event.title,
      className: event.className
    }));
  }

  addEvent(title: string): void {
    this.events.push({title: title, date: new Date().toISOString(), className: 'bg-primary'});
  }

  removeEvent(title: string): void {
    this.events = this.events.filter(event => event.title !== title);
  }
}
