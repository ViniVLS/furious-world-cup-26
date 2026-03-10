import {Routes} from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { 
    path: '', 
    loadComponent: () => import('./features/landing/landing.component').then(m => m.LandingComponent) 
  },
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },
  {
    path: 'onboarding',
    loadChildren: () =>
      import('./features/auth/onboarding/onboarding.routes').then(m => m.ONBOARDING_ROUTES),
    canActivate: [authGuard]
  },
  {
    path: 'album',
    loadChildren: () =>
      import('./features/album/album.routes').then(m => m.ALBUM_ROUTES),
    canActivate: [authGuard]
  },
  {
    path: 'packs',
    loadChildren: () =>
      import('./features/packs/packs.routes').then(m => m.PACKS_ROUTES),
    canActivate: [authGuard]
  },
  {
    path: 'trading',
    loadChildren: () =>
      import('./features/trading/trading.routes').then(m => m.TRADING_ROUTES),
    canActivate: [authGuard]
  },
  {
    path: 'ranking',
    loadChildren: () =>
      import('./features/ranking/ranking.routes').then(m => m.RANKING_ROUTES),
    canActivate: [authGuard]
  },
  {
    path: 'challenges',
    loadChildren: () =>
      import('./features/challenges/challenge.routes').then(m => m.CHALLENGE_ROUTES),
    canActivate: [authGuard]
  },
  {
    path: 'profile',
    loadChildren: () =>
      import('./features/profile/profile.routes').then(m => m.PROFILE_ROUTES),
    canActivate: [authGuard]
  },
  {
    path: 'info',
    loadChildren: () =>
      import('./features/info/info.routes').then(m => m.INFO_ROUTES)
  },
  { path: '**', redirectTo: '/album' }
];
