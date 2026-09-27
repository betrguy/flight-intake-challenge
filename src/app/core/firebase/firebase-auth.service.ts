import { Injectable, inject, signal, computed, NgZone } from '@angular/core';
import {
  Auth,
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  UserCredential,
} from 'firebase/auth';
import { Observable } from 'rxjs';
import { FIREBASE_AUTH } from './firebase.providers';

@Injectable({
  providedIn: 'root',
})
export class FirebaseAuthService {
  private readonly auth = inject(FIREBASE_AUTH);
  private readonly ngZone = inject(NgZone);

  private readonly _currentUser = signal<User | null>(null);
  readonly currentUser = this._currentUser.asReadonly();
  readonly isAuthenticated = computed(() => !!this._currentUser());

  constructor() {
    onAuthStateChanged(this.auth, (user) => {
      this.ngZone.run(() => {
        this._currentUser.set(user);
      });
    });
  }

  async signIn(email: string, password: string): Promise<UserCredential> {
    const cred = await signInWithEmailAndPassword(this.auth, email, password);
    this._currentUser.set(cred.user);
    return cred;
  }

  async signUp(email: string, password: string): Promise<UserCredential> {
    const cred = await createUserWithEmailAndPassword(this.auth, email, password);
    this._currentUser.set(cred.user);
    return cred;
  }

  async signOut(): Promise<void> {
    await signOut(this.auth);
    this._currentUser.set(null);
  }

  getAuthState(): Observable<User | null> {
    return new Observable<User | null>((subscriber) => {
      const unsubscribe = onAuthStateChanged(
        this.auth,
        (user) => subscriber.next(user),
        (error) => subscriber.error(error),
        () => subscriber.complete()
      );
      return () => unsubscribe();
    });
  }
}
