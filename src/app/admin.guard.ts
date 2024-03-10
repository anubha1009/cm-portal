import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const adminGuard: CanActivateFn = (route, state) => {
  if(inject(AuthService).isLoggedIn() && inject(AuthService).getRole() === 'admin'){
    return true;
  }
  else {
    // clear session
    inject(AuthService).clearSession();
    // route to login page
    inject(Router).navigate(['/']);
    return false;
  }
};
