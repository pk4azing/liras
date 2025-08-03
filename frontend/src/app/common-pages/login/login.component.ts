import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import {
  FormControl,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { merge } from 'rxjs';
import { AuthServiceService } from '../../common/services/auth-service/auth-service.service';
import { UserCredentials } from '../../common/services/auth-service/auth';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, MatIconModule, ReactiveFormsModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss', '../../styles/style.min.css'],
})
export class LoginComponent {
  hide = [signal(true), signal(true), signal(true)];
  submitted = false;
  redirectUrl: string | null = null;

  readonly email = new FormControl('', [
    Validators.required,
    Validators.email,
    Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'),
  ]);

  password = new FormControl('', [Validators.required]);

  errorMessage = signal('');
  forgotClicked = false;
  ForgotPassword: boolean = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private authService: AuthServiceService
  ) {
    merge(this.email.statusChanges, this.email.valueChanges)
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.updateErrorMessage());
  }

  updateErrorMessage() {
    if (this.email.hasError('required')) {
      this.errorMessage.set('Email cannot be empty');
    } else if (this.email.hasError('email') || this.email.hasError('pattern')) {
      this.errorMessage.set('Not a valid email');
    } else {
      this.errorMessage.set('');
    }
  }

  clickEvent(index: number, event: MouseEvent) {
    this.hide[index].set(!this.hide[index]());
    event.stopPropagation();
  }

  toggleForgotPassword(): void {
    this.ForgotPassword = !this.ForgotPassword;
  }

  onForgotSubmit() {
    if (this.email.valid) {
      this.submitted = true;
      // Optionally send forgot-password email via API
    } else {
      this.email.markAsTouched();
    }
  }

  onSubmit() {
    this.submitted = true;

    if (this.email.valid && this.password.valid) {
      const credentials: UserCredentials = {
        email: this.email.value!,
        password: this.password.value!,
      };

      this.authService
        .logIn(credentials.email, credentials.password)
        .subscribe({
          next: (data) => {
            console.log('Login successful:', data);

            // Log saved localStorage values
            console.log('Token:', localStorage.getItem('token'));
            console.log('ID:', localStorage.getItem('id'));
            console.log('Username:', localStorage.getItem('username'));
            console.log('Phone:', localStorage.getItem('phone'));

            const redirectUrl =
              this.route.snapshot.queryParamMap.get('redirectUrl');
            const target = redirectUrl || '/ccd-home/ccd-activity';
            this.router.navigateByUrl(target);
          },
          error: (error) => {
            console.error('Login error:', error);

            // Try to extract meaningful server message
            const backendMessage =
              error.error?.message ||
              error.error?.detail ||
              'Invalid email or password.';

            this.errorMessage.set(backendMessage);
          },
        });
    } else {
      this.email.markAsTouched();
      this.password.markAsTouched();
      console.log('Form is invalid');
    }
  }
}
