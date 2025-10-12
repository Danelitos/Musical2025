import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { Confirmacion } from './components/confirmacion/confirmacion';
import { PoliticaPrivacidad } from './components/politica-privacidad/politica-privacidad';
import { TerminosCondiciones } from './components/terminos-condiciones/terminos-condiciones';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'confirmacion', component: Confirmacion },
  { path: 'politica-privacidad', component: PoliticaPrivacidad },
  { path: 'terminos-condiciones', component: TerminosCondiciones },
  { path: '**', redirectTo: '' }
];
