import { Routes } from '@angular/router';
import { LegalPageComponent } from './legal-page.component';

export const INFO_ROUTES: Routes = [
  { path: 'terms', component: LegalPageComponent, data: { type: 'terms' } },
  { path: 'privacy', component: LegalPageComponent, data: { type: 'privacy' } },
  { path: 'cookies', component: LegalPageComponent, data: { type: 'cookies' } },
  { path: 'refund', component: LegalPageComponent, data: { type: 'refund' } },
  { path: 'about', component: LegalPageComponent, data: { type: 'about' } },
  { path: 'contact', component: LegalPageComponent, data: { type: 'contact' } },
  { path: 'faq', component: LegalPageComponent, data: { type: 'faq' } },
  {
    path: 'prediction-2026',
    loadComponent: () => import('./prediction-2026/prediction-2026.component').then(m => m.Prediction2026Component)
  },
  {
    path: 'relics-2022',
    loadComponent: () => import('./relics-2022/relics-2022.component').then(m => m.Relics2022Component)
  },
];
