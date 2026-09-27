import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { LoginComponent } from './login.component';
import { FirebaseAuthService } from '../../core/firebase/firebase-auth.service';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let mockAuthService: { login: ReturnType<typeof vi.fn> };
  let mockRouter: { navigate: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    mockAuthService = {
      login: vi.fn(),
    };
    mockRouter = {
      navigate: vi.fn().mockResolvedValue(true),
    };

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        { provide: FirebaseAuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('Test 1: should be invalid when inputs are empty', () => {
    expect(component.loginForm.valid).toBe(false);
    expect(component.loginForm.get('email')?.valid).toBe(false);
    expect(component.loginForm.get('password')?.valid).toBe(false);
  });

  it('Test 2: should invoke FirebaseAuthService.login() when form is submitted with valid data', async () => {
    mockAuthService.login.mockResolvedValue({ user: { email: 'reviewer@challenge.com' } });

    component.loginForm.setValue({
      email: 'reviewer@challenge.com',
      password: 'Challenge2026!',
    });

    expect(component.loginForm.valid).toBe(true);

    await component.onSubmit();

    expect(mockAuthService.login).toHaveBeenCalledWith('reviewer@challenge.com', 'Challenge2026!');
  });

  it('Test 3: should redirect to /flight-entry on successful login', async () => {
    mockAuthService.login.mockResolvedValue({ user: { email: 'reviewer@challenge.com' } });

    component.loginForm.setValue({
      email: 'reviewer@challenge.com',
      password: 'Challenge2026!',
    });

    await component.onSubmit();

    expect(mockRouter.navigate).toHaveBeenCalledWith(['/flight-entry']);
  });

  it('should display an error message when login fails', async () => {
    mockAuthService.login.mockRejectedValue({ code: 'auth/invalid-credential' });

    component.loginForm.setValue({
      email: 'wrong@example.com',
      password: 'wrongpassword',
    });

    await component.onSubmit();

    expect(component.errorMessage()).toContain('Invalid email or password');
    expect(component.isLoading()).toBe(false);
  });

  it('should auto-fill evaluation credentials when helper is clicked', () => {
    component.fillEvaluationCredentials();

    expect(component.loginForm.get('email')?.value).toBe('reviewer@challenge.com');
    expect(component.loginForm.get('password')?.value).toBe('Challenge2026!');
    expect(component.loginForm.valid).toBe(true);
  });
});
