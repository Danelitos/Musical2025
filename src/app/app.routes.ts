import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { Confirmacion } from './components/confirmacion/confirmacion';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'confirmacion', component: Confirmacion },
  { path: '**', redirectTo: '' }
];
