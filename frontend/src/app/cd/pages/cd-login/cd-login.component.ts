import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { merge } from 'rxjs';


@Component({
  selector: 'app-cd-login',
  imports: [
    CommonModule,
    MatIconModule,
    ReactiveFormsModule,
    FormsModule,
  ],
  templateUrl: './cd-login.component.html',
  styleUrls: [
    './cd-login.component.scss',
    '../../../styles/style.min.css',
  ]
})
export class CdLoginComponent {
  hide = [signal(true), signal(true), signal(true)];
  submitted = false;



  readonly email = new FormControl('', [
    Validators.required,
    Validators.email,
    Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'),
  ]);
  password = new FormControl('', []);
  errorMessage = signal('');
  forgotClicked = false;
  ForgotPassword: boolean = false;


  constructor(private router: Router, private dialog: MatDialog) {
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

      // Optionally: Call API here

      // Reset after a delay if needed
      // setTimeout(() => {
      //   this.submitted = false;
      //   this.toggleForgotPassword();
      // }, 5000);
    } else {
      this.email.markAsTouched();
    }
  }



  onSubmit() {
    this.submitted = true;

    if (this.email.valid && this.password.valid) {
      const emailValue = this.email.value;
      const passwordValue = this.password.value;
      console.log('Email:', emailValue);
      console.log('Password:', passwordValue);
      this.router.navigate(['/ccd-home/ccd-activity']);
    } else {
      // This triggers the validation display
      this.email.markAsTouched();
      this.password.markAsTouched();
      console.log('Form is invalid');
    }
  }



}
