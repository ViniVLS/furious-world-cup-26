import { Routes } from '@angular/router';

export const ALBUM_ROUTES: Routes = [
  { 
    path: '', 
    loadComponent: () => import('./album-home/album-home.component').then(m => m.AlbumHomeComponent) 
  },
  { 
    path: ':edition', 
    loadComponent: () => import('./edition-view/edition-view.component').then(m => m.EditionViewComponent) 
  },
  { 
    path: ':edition/:countryCode', 
    loadComponent: () => import('./team-view/team-view.component').then(m => m.TeamViewComponent) 
  },
  { 
    path: 'sticker/:stickerId', 
    loadComponent: () => import('./sticker-detail/sticker-detail.component').then(m => m.StickerDetailComponent) 
  }
];
