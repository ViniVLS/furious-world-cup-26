import {ChangeDetectionStrategy, Component, inject, signal, computed} from '@angular/core';
import {RouterOutlet, Router, NavigationEnd} from '@angular/router';
import {BottomNavComponent} from './shared/components/bottom-nav/bottom-nav.component';
import {CookieConsentComponent} from './shared/components/cookie-consent/cookie-consent.component';
import {CommonModule} from '@angular/common';
import {filter} from 'rxjs/operators';
import {DebugPanelComponent} from '../debug/debug-panel/debug-panel.component';
import {DebugService} from '../debug/debug.service';
import {ToastComponent} from './shared/components/toast/toast.component';
import {UserService} from './core/services/user.service';
import {AdminStateService} from './core/services/admin-state.service';

const CREATOR_EMAIL = 'viniedoug@gmail.com';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-root',
  imports: [RouterOutlet, BottomNavComponent, CookieConsentComponent, CommonModule, DebugPanelComponent, ToastComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private router = inject(Router);
  private readonly debug = inject(DebugService);
  private readonly userService = inject(UserService);
  private readonly adminStateService = inject(AdminStateService);
  showBottomNav = signal(false);
  showDebugPanel = computed(() => {
    const user = this.userService.currentUser();
    if (user?.role === 'admin') return true;
    if (typeof localStorage === 'undefined') return false;
    const storedEmail = localStorage.getItem('furia-creator-email');
    return storedEmail === CREATOR_EMAIL;
  });
  private previousUrl = '/';

  constructor() {
    this.debug.info('LIFECYCLE', 'App', 'App component initialized');
    const user = this.userService.currentUser();
    this.adminStateService.setAdminUser(user ?? null);
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      const url = event.urlAfterRedirects;
      this.debug.logNavigation(this.previousUrl, url, { reason: 'NavigationEnd' });
      this.previousUrl = url;
      this.showBottomNav.set(!(url === '/' || url.startsWith('/auth') || url.startsWith('/onboarding')));
    });
  }
}
