import { TestBed } from '@angular/core/testing';
import { User, UserCredential } from 'firebase/auth';
import { FirebaseAuthService } from './firebase-auth.service';
import { FIREBASE_AUTH } from './firebase.providers';
import { vi, describe, it, expect, beforeEach } from 'vitest';

let authCallback: ((user: User | null) => void) | null = null;
const mockSignInWithEmailAndPassword = vi.fn();
const mockCreateUserWithEmailAndPassword = vi.fn();
const mockSignOut = vi.fn();

vi.mock('firebase/auth', () => ({
  onAuthStateChanged: vi.fn((_auth: any, callback: (user: User | null) => void) => {
    authCallback = callback;
    callback(null);
    return () => {};
  }),
  signInWithEmailAndPassword: (...args: any[]) => mockSignInWithEmailAndPassword(...args),
  createUserWithEmailAndPassword: (...args: any[]) => mockCreateUserWithEmailAndPassword(...args),
  signOut: (...args: any[]) => mockSignOut(...args),
}));

describe('FirebaseAuthService', () => {
  let service: FirebaseAuthService;
  let mockAuth: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth = {
      currentUser: null,
    };

    TestBed.configureTestingModule({
      providers: [
        FirebaseAuthService,
        { provide: FIREBASE_AUTH, useValue: mockAuth },
      ],
    });

    service = TestBed.inject(FirebaseAuthService);
  });

  it('should be created and default to unauthenticated', () => {
    expect(service).toBeTruthy();
    expect(service.isAuthenticated()).toBe(false);
    expect(service.currentUser()).toBeNull();
  });

  it('should update current user when auth state changes', () => {
    const mockUser = { uid: 'user-123', email: 'test@example.com' } as unknown as User;
    if (authCallback) {
      authCallback(mockUser);
    }
    expect(service.currentUser()).toBe(mockUser);
    expect(service.isAuthenticated()).toBe(true);
  });

  it('should sign in with email and password', async () => {
    const mockUser = { uid: 'u1', email: 'test@monster.dev' } as unknown as User;
    const mockCred: UserCredential = {
      user: mockUser,
      providerId: 'password',
      operationType: 'signIn',
    };

    mockSignInWithEmailAndPassword.mockResolvedValue(mockCred);

    const result = await service.signIn('test@monster.dev', 'password123');
    expect(result).toBe(mockCred);
    expect(service.currentUser()).toBe(mockUser);
    expect(service.isAuthenticated()).toBe(true);
  });

  it('should sign up with email and password', async () => {
    const mockUser = { uid: 'u2', email: 'new@monster.dev' } as unknown as User;
    const mockCred: UserCredential = {
      user: mockUser,
      providerId: 'password',
      operationType: 'signIn',
    };

    mockCreateUserWithEmailAndPassword.mockResolvedValue(mockCred);

    const result = await service.signUp('new@monster.dev', 'securePassword!');
    expect(result).toBe(mockCred);
    expect(service.currentUser()).toBe(mockUser);
  });

  it('should sign out and clear currentUser', async () => {
    mockSignOut.mockResolvedValue(undefined);

    await service.signOut();
    expect(service.currentUser()).toBeNull();
    expect(service.isAuthenticated()).toBe(false);
  });

  it('should emit auth state stream from getAuthState()', () => {
    let emittedUser: User | null = undefined as any;
    const subscription = service.getAuthState().subscribe((user) => {
      emittedUser = user;
    });

    expect(emittedUser).toBeNull();

    const testUser = { uid: 'u3' } as unknown as User;
    if (authCallback) {
      authCallback(testUser);
    }
    expect(emittedUser).toBe(testUser);

    subscription.unsubscribe();
  });
});
