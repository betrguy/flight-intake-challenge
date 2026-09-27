import { Routes } from '@angular/router';
import { LoginComponent } from './features/login/login.component';
import { FlightFormComponent } from './features/flight-form/flight-form.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'flight-entry',
    component: FlightFormComponent,
    canActivate: [authGuard],
  },
  {
    path: '',
    redirectTo: 'flight-entry',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: 'flight-entry',
  },
];
