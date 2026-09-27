import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { LoginComponent } from './login.component';
import { FirebaseAuthService } from '../../core/firebase/firebase-auth.service';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let mockAuthService: { login: ReturnType<typeof vi.fn> };
  let mockRouter: { navigate: ReturnType<typeof vi.fn> };
  let mockActivatedRoute: { snapshot: { queryParamMap: { get: ReturnType<typeof vi.fn> } } };

  beforeEach(async () => {
    mockAuthService = {
      login: vi.fn(),
    };
    mockRouter = {
      navigate: vi.fn().mockResolvedValue(true),
    };
    mockActivatedRoute = {
      snapshot: {
        queryParamMap: {
          get: vi.fn().mockReturnValue(null),
        },
      },
    };

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        { provide: FirebaseAuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
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
    mockAuthService.login.mockResolvedValue({ user: { email: 'user@example.com' } });

    component.loginForm.setValue({
      email: 'user@example.com',
      password: 'SecurePassword123!',
    });

    expect(component.loginForm.valid).toBe(true);

    await component.onSubmit();

    expect(mockAuthService.login).toHaveBeenCalledWith('user@example.com', 'SecurePassword123!');
  });

  it('Test 3: should redirect to /flight-entry on successful login', async () => {
    mockAuthService.login.mockResolvedValue({ user: { email: 'user@example.com' } });

    component.loginForm.setValue({
      email: 'user@example.com',
      password: 'SecurePassword123!',
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

  it('should display session expired notification when sessionExpired query param is present', () => {
    mockActivatedRoute.snapshot.queryParamMap.get.mockReturnValue('true');
    component.ngOnInit();

    expect(component.errorMessage()).toBe('Your session has expired. Please sign in again.');
  });
});
