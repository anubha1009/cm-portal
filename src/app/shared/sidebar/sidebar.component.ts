import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { SharedModule } from '../shared.module';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../auth.service';
import { ApiService } from '../../api.service';
import { Router } from '@angular/router';
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';

@Component({
  selector: 'app-sidebar',
  standalone: false,
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
  animations: [
    trigger('slideInOut', [
      transition(':enter', [
        style({ opacity: 0, width: '0' }),
        animate('300ms', style({ width: '*' })),
        animate('0ms', style({ opacity: 1 })),
      ]),
      transition(':leave', [
        style({ opacity: 1, width: '*' }),
        animate('0ms', style({ opacity: 0 })),
        animate('300ms', style({ width: 0 })),
      ]),
    ]),
  ],
})
export class SidebarComponent implements OnInit {
  isLeftVisible = false;
  isCollapsed = false;
  selectedItem = { index: 0, list: 'top' };
  menuItemsTop : any[] = [];
  menuCopy = [];
  role: string | null | undefined;
  userDetails: any;
  adminDetails: any;
  @ViewChild('bounceButton') bounceButton: ElementRef | undefined;
  isMobile: boolean = true;

  constructor(
    private authService: AuthService,
    private apiService: ApiService,
    private router: Router
  ) {
    this.role = this.authService.getRole();
    this.setMenuItemsByRole();
    this.authService.getRoute().subscribe((data: any) => {
      //console.log(data);
      this.selectedItem = data;
      //console.log(this.menuItemsTop);
    });

    //get user device resolution
    if (window.innerWidth > 768) {
      this.isMobile = false;
      this.isLeftVisible = true;
    }
  }
  
  async setMenuItemsByRole() {
    this.authService.isAdmin() ? this.menuItemsTop = (this.authService.isSuperAdmin() ? this.superAdminMenuItems : this.adminMenuItems) : 
      this.menuItemsTop = this.ownerMenuItems;
    this.userDetails = JSON.parse(this.authService.getUserDetails()!);
    if (this.authService.isOwner()) {  
      this.getVehicleCount();
    }
  }

  ngOnInit(): void {
    this.setCurrentMenuItemBasedOnUrl();
    if (this.role == 'owner') {
      // check if owner has a vehicle
      this.getVehicleCount();
    }

    this.authService.getLink().subscribe((data: any) => {
      //console.log(data);
      if (data == 'vehicles') {
        this.getVehicleCount();
      }

    });
    setTimeout(() => {
      this.bounceButton!.nativeElement.classList.add('bounce-right');
    }, 0);
  }

  setCurrentMenuItemBasedOnUrl() {
    const currentUrl = this.router.url;
    const foundIndex = this.menuItemsTop.findIndex(item => currentUrl == item.link);
  if (foundIndex !== -1) {
    this.setSelectedItem({ index: foundIndex, list: 'top' });
  }
  }

  getVehicleCount() {
    this.apiService
      .getVehiclesOfOwner(this.userDetails?.ownerID)
      .subscribe((data: any) => {
        //console.log(data);
        sessionStorage.setItem('vehiclesCount', data.length);
        if (data.length == 0) {
          this.menuItemsTop.splice(0, 1);
          this.setSelectedItem({
            index: 0,
            list: 'top',
          });
          this.router.navigate(['/home/vehicles']);
        }
      });
  }

  setLeftVisible(value: boolean) {
    //console.log("Left visible: " + value);
    this.isLeftVisible = value;
  }

  setSelectedItem(item: { index: any; list: string }) {
    //console.log(item);
    this.selectedItem = item;
  }

  getDivClass() {
    let classes =
      'flex flex-col h-screen bg-purple-300 border-r border-gray-300 transition-all duration-200 mob-zindex-sidebar col-mob';
    classes += this.isLeftVisible ? ' visible' : ' hidden md:block';
    classes += this.isCollapsed
      ? ' hidden md:flex md:w-16'
      : ' w-3/5 md:w-64';
    return classes;
  }

  handleCollapse() {
    this.isCollapsed = !this.isCollapsed;
  }

  routeChange(link: string) {
    this.router.navigate([link]);
  }

  onTopMenuItemClick(item: any, index: number) {
    this.setSelectedItem({ index: index, list: 'top' });
    this.routeChange(item.link);
  }

  logout() {
    sessionStorage.clear();
    window.location.reload();
  }

  ownerMenuItems = [
    {
      name: 'Vehicles',
      link: '/home/vehicles',
      icon: '../assets/images/receipt-2-1-svgrepo-com.svg',
      iconSelected: '../assets/images/receipt-2-1-svgrepo-com-white.svg',
      selected: false,
    },
    {
      name: 'Appointments',
      link: '/home/appointments',
      icon: '../assets/images/chat-round-svgrepo-com.svg',
      iconSelected: '../assets/images/chat-round-svgrepo-com-white.svg',
      selected: false,
    },
    {
      name: 'Profile',
      link: '/home/profile',
      icon: '../assets/images/profile-circle-svgrepo-com.svg',
      iconSelected: '../assets/images/profile-circle-svgrepo-com-white.svg',
      selected: false,
    },
    {
      name: 'Logout',
      link: '/#',
      icon: '../assets/images/logout-2-svgrepo-com.svg',
      iconSelected: '../assets/images/logout-2-svgrepo-com-white.svg',
      selected: false,
    },
  ];

  adminMenuItems = [
    {
      name: 'Providers',
      link: '/admin/providers',
      icon: '../assets/images/receipt-2-1-svgrepo-com.svg',
      iconSelected: '../assets/images/receipt-2-1-svgrepo-com-white.svg',
      selected: false,
    },
    {
      name: 'Appointments',
      link: '/admin/appointments',
      icon: '../assets/images/chat-round-svgrepo-com.svg',
      iconSelected: '../assets/images/chat-round-svgrepo-com-white.svg',
      selected: false,
    },
    {
      name: 'Profile',
      link: '/admin/profile',
      icon: '../assets/images/profile-circle-svgrepo-com.svg',
      iconSelected: '../assets/images/profile-circle-svgrepo-com-white.svg',
      selected: false,
    },
    {
      name: 'Logout',
      link: '/#',
      icon: '../assets/images/logout-2-svgrepo-com.svg',
      iconSelected: '../assets/images/logout-2-svgrepo-com-white.svg',
      selected: false,
    },
  ];

  superAdminMenuItems = [
    {
      name: 'Manager',
      link: '/admin/manager',
      icon: '../assets/images/home-smile-angle-svgrepo-com.svg',
      iconSelected: '../assets/images/home-smile-angle-svgrepo-com-white.svg',
      selected: true,
    },
    {
      name: 'Providers',
      link: '/admin/providers',
      icon: '../assets/images/receipt-2-1-svgrepo-com.svg',
      iconSelected: '../assets/images/receipt-2-1-svgrepo-com-white.svg',
      selected: false,
    },
    {
      name: 'Appointments',
      link: '/admin/appointments',
      icon: '../assets/images/chat-round-svgrepo-com.svg',
      iconSelected: '../assets/images/chat-round-svgrepo-com-white.svg',
      selected: false,
    },
    {
      name: 'Profile',
      link: '/admin/profile',
      icon: '../assets/images/profile-circle-svgrepo-com.svg',
      iconSelected: '../assets/images/profile-circle-svgrepo-com-white.svg',
      selected: false,
    },
    {
      name: 'Logout',
      link: '/#',
      icon: '../assets/images/logout-2-svgrepo-com.svg',
      iconSelected: '../assets/images/logout-2-svgrepo-com-white.svg',
      selected: false,
    },
  ];
}
