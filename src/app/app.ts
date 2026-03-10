import {ChangeDetectionStrategy, Component, inject, signal} from '@angular/core';
import {RouterOutlet, Router, NavigationEnd} from '@angular/router';
import {BottomNavComponent} from './shared/components/bottom-nav/bottom-nav.component';
import {CookieConsentComponent} from './shared/components/cookie-consent/cookie-consent.component';
import {CommonModule} from '@angular/common';
import {filter} from 'rxjs/operators';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-root',
  imports: [RouterOutlet, BottomNavComponent, CookieConsentComponent, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private router = inject(Router);
  showBottomNav = signal(false);

  constructor() {
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      const url = event.urlAfterRedirects;
      this.showBottomNav.set(!(url === '/' || url.startsWith('/auth') || url.startsWith('/onboarding')));
    });
  }
}
