import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { authGuard } from './auth.guard';
import { FirebaseAuthService } from '../firebase/firebase-auth.service';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('authGuard', () => {
  let mockAuthService: { isAuthenticated: ReturnType<typeof vi.fn> };
  let router: Router;
  const mockRoute = {} as ActivatedRouteSnapshot;
  const mockState = { url: '/flight-entry' } as RouterStateSnapshot;

  beforeEach(() => {
    mockAuthService = {
      isAuthenticated: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [{ provide: FirebaseAuthService, useValue: mockAuthService }],
    });

    router = TestBed.inject(Router);
  });

  it('Test 1: should permit route activation when user is authenticated', () => {
    mockAuthService.isAuthenticated.mockReturnValue(true);

    const result = TestBed.runInInjectionContext(() => authGuard(mockRoute, mockState));

    expect(result).toBe(true);
  });

  it('Test 2: should redirect to /login when user is unauthenticated', () => {
    mockAuthService.isAuthenticated.mockReturnValue(false);

    const result = TestBed.runInInjectionContext(() => authGuard(mockRoute, mockState));

    expect(result instanceof UrlTree).toBe(true);
    expect((result as UrlTree).toString()).toBe('/login');
  });
});
