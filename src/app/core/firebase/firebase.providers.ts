import { InjectionToken, Provider } from '@angular/core';
import { FirebaseApp, getApps, initializeApp } from 'firebase/app';
import { Auth, getAuth } from 'firebase/auth';
import { FirebaseConfig } from '../../../environments/environment.model';

export const FIREBASE_CONFIG = new InjectionToken<FirebaseConfig>('FIREBASE_CONFIG');
export const FIREBASE_APP = new InjectionToken<FirebaseApp>('FIREBASE_APP');
export const FIREBASE_AUTH = new InjectionToken<Auth>('FIREBASE_AUTH');

export function provideFirebase(config: FirebaseConfig): Provider[] {
  return [
    {
      provide: FIREBASE_CONFIG,
      useValue: config,
    },
    {
      provide: FIREBASE_APP,
      useFactory: (cfg: FirebaseConfig): FirebaseApp => {
        const existingApps = getApps();
        if (existingApps.length > 0) {
          return existingApps[0];
        }
        return initializeApp(cfg);
      },
      deps: [FIREBASE_CONFIG],
    },
    {
      provide: FIREBASE_AUTH,
      useFactory: (app: FirebaseApp): Auth => getAuth(app),
      deps: [FIREBASE_APP],
    },
  ];
}
