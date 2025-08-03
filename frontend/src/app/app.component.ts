import { Component, Renderer2, Inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { DOCUMENT } from '@angular/common';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  // templateUrl: './app.component.html',
  styleUrls: [
    './app.component.scss',
    'styles/style.min.css',
    'styles/summernote.css',
  ],
    template: `
    <router-outlet />
    `,
  standalone: true,
})
// Adjust path as needed})
export class AppComponent {
  title = 'LFCDCCD';
  
  isOffcanvasActive = false;

  toggleOffcanvas() {
    this.isOffcanvasActive = !this.isOffcanvasActive;
  }
}
