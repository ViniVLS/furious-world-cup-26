import { Routes } from '@angular/router';

export const PROFILE_ROUTES: Routes = [
  { 
    path: '', 
    loadComponent: () => import('./my-profile/my-profile.component').then(m => m.MyProfileComponent) 
  },
  { 
    path: 'creator', 
    loadComponent: () => import('./sticker-creator/sticker-creator.component').then(m => m.StickerCreatorComponent) 
  },
  { 
    path: 'settings', 
    loadComponent: () => import('./settings/settings.component').then(m => m.SettingsComponent) 
  }
];
