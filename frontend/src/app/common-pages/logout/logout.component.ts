import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { take, timer } from 'rxjs';

@Component({
  selector: 'app-logout',
  standalone: true,
  templateUrl: './logout.component.html',
  styleUrls: ['./logout.component.scss']
})
export class LogoutComponent implements OnInit {
  countdown = 3;

  constructor(private router: Router) {}

  ngOnInit(): void {
    // ✅ Clear only login-related localStorage keys
    localStorage.removeItem('token');
    localStorage.removeItem('id');
    localStorage.removeItem('username');
    localStorage.removeItem('phone');

    // Optional: Clear all if you prefer
    // localStorage.clear();

    // Start countdown timer
    timer(1000, 1000).pipe(take(this.countdown)).subscribe({
      next: () => this.countdown--,
      complete: () => this.router.navigate(['/login'])
    });
  }
}
