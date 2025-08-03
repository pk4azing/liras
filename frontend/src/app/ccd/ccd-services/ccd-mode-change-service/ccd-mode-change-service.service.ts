import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CcdModeChangeServiceService {

  private modeSubject = new BehaviorSubject<'light' | 'dark'>(this.getInitialMode());
  mode$ = this.modeSubject.asObservable();

  private getInitialMode(): 'light' | 'dark' {
    const savedMode = localStorage.getItem('selectedMode');
    return savedMode === 'dark' ? 'dark' : 'light';
  }

  setMode(mode: 'light' | 'dark') {
    localStorage.setItem('selectedMode', mode);
    this.modeSubject.next(mode);
  }

  getCurrentMode(): 'light' | 'dark' {
    return this.modeSubject.value;
  }
}
