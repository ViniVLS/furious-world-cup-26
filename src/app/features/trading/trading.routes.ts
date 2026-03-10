import { Routes } from '@angular/router';

export const TRADING_ROUTES: Routes = [
  { 
    path: '', 
    loadComponent: () => import('./marketplace/marketplace.component').then(m => m.MarketplaceComponent) 
  },
  { 
    path: 'offer', 
    loadComponent: () => import('./trade-offer/trade-offer.component').then(m => m.TradeOfferComponent) 
  },
  { 
    path: 'groups', 
    loadComponent: () => import('./trade-groups/trade-groups.component').then(m => m.TradeGroupsComponent) 
  }
];
