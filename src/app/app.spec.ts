import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { Location } from '@angular/common';
import { App } from './app';
import { routes } from './app.routes';
import { FirebaseAuthService } from './core/firebase/firebase-auth.service';
import { FlightService } from './core/services/flight.service';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { signal } from '@angular/core';

describe('App & Root Routing', () => {
  let fixture: ComponentFixture<App>;
  let router: Router;
  let location: Location;
  let mockAuthService: {
    isAuthenticated: ReturnType<typeof vi.fn>;
    currentUser: ReturnType<typeof signal>;
    login: ReturnType<typeof vi.fn>;
    logout: ReturnType<typeof vi.fn>;
  };
  let mockFlightService: {
    submitFlightInfo: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    mockAuthService = {
      isAuthenticated: vi.fn().mockReturnValue(false),
      currentUser: signal(null),
      login: vi.fn(),
      logout: vi.fn().mockResolvedValue(undefined),
    };
    mockFlightService = {
      submitFlightInfo: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter(routes),
        { provide: FirebaseAuthService, useValue: mockAuthService },
        { provide: FlightService, useValue: mockFlightService },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    location = TestBed.inject(Location);
    fixture = TestBed.createComponent(App);
    fixture.detectChanges();
  });

  it('should create the app root component', () => {
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should contain a router-outlet in the root template', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('router-outlet')).not.toBeNull();
  });

  it('should redirect unauthenticated users to /login when navigating to "/"', async () => {
    mockAuthService.isAuthenticated.mockReturnValue(false);

    await router.navigate(['/']);
    await fixture.whenStable();
    fixture.detectChanges();

    expect(location.path()).toBe('/login');
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-login')).not.toBeNull();
  });

  it('should render LoginComponent when navigating directly to "/login"', async () => {
    await router.navigate(['/login']);
    await fixture.whenStable();
    fixture.detectChanges();

    expect(location.path()).toBe('/login');
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-login')).not.toBeNull();
  });

  it('should allow authenticated users to navigate to "/flight-entry" and render FlightFormComponent', async () => {
    mockAuthService.isAuthenticated.mockReturnValue(true);
    mockAuthService.currentUser.set({ email: 'authorized@example.com' } as any);

    await router.navigate(['/flight-entry']);
    await fixture.whenStable();
    fixture.detectChanges();

    expect(location.path()).toBe('/flight-entry');
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-flight-form')).not.toBeNull();
  });
});
