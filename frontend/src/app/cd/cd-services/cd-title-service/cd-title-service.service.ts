import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CdTitleServiceService {

  private homeTitleSource = new BehaviorSubject<string>('Home');
  currentHomeTitle = this.homeTitleSource.asObservable();

  updateHomeTitle(title: string) {
    this.homeTitleSource.next(title);
  }

}
