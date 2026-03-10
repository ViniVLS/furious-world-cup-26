import { Routes } from '@angular/router';

export const PACKS_ROUTES: Routes = [
  { 
    path: '', 
    loadComponent: () => import('./pack-list/pack-list.component').then(m => m.PackListComponent) 
  },
  { 
    path: 'open/:packType', 
    loadComponent: () => import('./pack-opening-page/pack-opening-page.component').then(m => m.PackOpeningPageComponent) 
  }
];
