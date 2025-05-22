import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'seating',
    loadComponent: () => import('./pages/seating/seating.component').then(m => m.SeatingComponent)
  },
  {
    path: 'confirmation',
    loadComponent: () => import('./pages/confirmation/confirmation.component').then(m => m.ConfirmationComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];