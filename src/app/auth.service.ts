import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  sessionStorage: Storage | undefined;
  route: BehaviorSubject<any> = new BehaviorSubject<any>('');

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      this.sessionStorage = sessionStorage;
      
    }
  }

  isLoggedIn() {
    return this.sessionStorage?.getItem('token') != null;
  }

  getToken() {
    return this.sessionStorage?.getItem('token');
  }

  getRole() {
    return this.sessionStorage?.getItem('role');
  }

  getUserDetails() {
    return this.getRole() == 'admin' ? this.sessionStorage?.getItem('admin') : this.sessionStorage?.getItem('owner');
  }

  getRoute() {
    return this.route.asObservable();
  }

  setRoute(route: any) {
    this.route.next(route);
  }

}
