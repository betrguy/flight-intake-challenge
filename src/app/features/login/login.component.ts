import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FirebaseAuthService } from '../../core/firebase/firebase-auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  readonly authService = inject(FirebaseAuthService);
  readonly router = inject(Router);

  readonly loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  readonly isLoading = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    if (this.route.snapshot.queryParamMap.get('sessionExpired') === 'true') {
      this.errorMessage.set('Your session has expired. Please sign in again.');
    }
  }

  async onSubmit(): Promise<void> {
    if (this.loginForm.invalid || this.isLoading()) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const { email, password } = this.loginForm.getRawValue();

    try {
      await this.authService.login(email, password);
      await this.router.navigate(['/flight-entry']);
    } catch (error: any) {
      const code = error?.code || '';
      let userFriendlyMsg = 'Authentication failed. Please verify your credentials and try again.';

      if (
        code === 'auth/invalid-credential' ||
        code === 'auth/user-not-found' ||
        code === 'auth/wrong-password'
      ) {
        userFriendlyMsg = 'Invalid email or password. Please verify your credentials.';
      } else if (code === 'auth/too-many-requests') {
        userFriendlyMsg = 'Access temporarily disabled due to too many failed attempts. Try again later.';
      } else if (error?.message) {
        userFriendlyMsg = error.message;
      }

      this.errorMessage.set(userFriendlyMsg);
    } finally {
      this.isLoading.set(false);
    }
  }
}
