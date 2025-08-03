import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';


export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const token = localStorage.getItem('token');

  if (token) {
    return true;
  }

  // Redirect to login if not logged in
  return router.createUrlTree(['/login'], {
    queryParams: { redirectUrl: state.url }
  });
};
