import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  sessionStorage: Storage | undefined;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      this.sessionStorage = sessionStorage;
      
    }
  }

  isLoggedIn() {
    return this.sessionStorage?.getItem('token') != null;
  }
}
