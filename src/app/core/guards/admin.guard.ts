import { CanActivateFn, Router } from '@angular/router';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { UserService } from '../services/user.service';

const CREATOR_EMAIL = 'viniedoug@gmail.com';
const CREATOR_KEY = 'furia-creator-email';

export const adminGuard: CanActivateFn = (_route, _state) => {
  const userService = inject(UserService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  const user = userService.currentUser();

  // Allow if user has admin role
  if (user?.role === 'admin') return true;

  // Allow if creator email is in localStorage
  if (isPlatformBrowser(platformId)) {
    const storedEmail = localStorage.getItem(CREATOR_KEY);
    if (storedEmail === CREATOR_EMAIL) return true;
  }

  router.navigate(['/album']);
  return false;
};
