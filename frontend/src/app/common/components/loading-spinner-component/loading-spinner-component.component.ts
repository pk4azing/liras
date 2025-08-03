import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { LoadingSpinnerServiceService } from '../../services/loading-spinner-service/loading-spinner-service.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router } from '@angular/router';


@Component({
  selector: 'app-loading-spinner-component',
  imports: [CommonModule, MatProgressSpinnerModule],
  templateUrl: './loading-spinner-component.component.html',
  styleUrl: './loading-spinner-component.component.scss',
})
export class LoadingSpinnerComponentComponent {
  constructor(private router: Router, public loadingService: LoadingSpinnerServiceService) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.loadingService.show();
      } else if (
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError
      ) {
        this.loadingService.hide();
      }
    });
  }


}
