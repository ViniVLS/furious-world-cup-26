import { Routes } from '@angular/router';

export const RANKING_ROUTES: Routes = [
  { 
    path: '', 
    loadComponent: () => import('./hall-of-fame/hall-of-fame.component').then(m => m.HallOfFameComponent) 
  }
];
