import { Component, OnInit } from '@angular/core';
import { SharedModule } from '../shared.module';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../auth.service';
import { ApiService } from '../../api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: false,
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {

  isLeftVisible = false;
  isCollapsed = false;
  selectedItem = { index: 0, list: 'top' };
  menuItemsTop = [
    {
      name: "Dashboard",
      link: "/home",
      icon: "../assets/images/home-smile-angle-svgrepo-com.svg",
      selected: true,
    },
    {
      name: "Vehicles",
      link: "/home/vehicles",
      icon: "../assets/images/receipt-2-1-svgrepo-com.svg",
      selected: false,
    },
    {
      name: "Appointments",
      link: "/#",
      icon: "../assets/images/chat-round-svgrepo-com.svg",
      selected: false,
    },
    // add more items as needed
  ];
  menuItemsBottom = [
    {
      name: "Profile",
      link: "/#",
      icon: "../assets/images/profile-circle-svgrepo-com.svg",
      selected: false,
    },
    {
      name: "Logout",
      link: "#",
      icon: "../assets/images/logout-2-svgrepo-com.svg",
      selected: false,
    },
  ];
  role: string | null | undefined;
  userDetails: any;

  constructor(private authService: AuthService, private apiService: ApiService, private router: Router) { 
    this.role = this.authService.getRole();
    this.userDetails = JSON.parse(this.authService.getUserDetails()!);
    this.authService.getRoute().subscribe((data: any) => {
      console.log(data);
      this.selectedItem = data;
    });
  }

  ngOnInit(): void {
    if(this.role == 'owner'){
      // check if owner has a vehicle
      this.apiService.getVehiclesOfOwner(this.userDetails?.ownerID).subscribe((data: any) => {
        console.log(data);
        sessionStorage.setItem('vehiclesCount', data.length);
        if(data.length == 0){
          // remove dashboard link
          this.menuItemsTop.splice(0, 1);
          this.router.navigate(['/home/vehicles']);
        }
      });
    }
  }

  setLeftVisible(value: boolean) {
    console.log(value);
    this.isLeftVisible = value;
  }

  setSelectedItem(item: { index: any, list: string }) {
    console.log(item);
    this.selectedItem = item;
    if(item.index == 1 && item.list == 'bottom'){
      this.logout();
    }
  }

  getDivClass() {
    let classes = 'flex flex-col h-screen bg-blue-50 border-r border-gray-300 transition-all duration-200 mob-zindex-sidebar col-mob';
    // classes += this.isCollapsed ? ' w-16' : '';
    classes += this.isLeftVisible ? ' hidden' : ' visible';
    return classes;
  }

  handleCollapse() {
    console.log("handle collapse" + this.isCollapsed);
    this.isCollapsed = !this.isCollapsed;
    console.log(this.isCollapsed);
    console.log(this.isLeftVisible);
  }

  logout() {
    sessionStorage.clear();
    window.location.reload();
  }
}
