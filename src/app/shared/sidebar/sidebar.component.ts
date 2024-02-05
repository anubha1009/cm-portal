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
  ];
  menuCopy = this.menuItemsTop;
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
      this.getVehicleCount();
    }

    this.authService.getLink().subscribe((data: any) => {
      console.log(data);
      if(data == 'vehicles'){
        this.getVehicleCount();
      }
    }
    );

    console.log(this.isLeftVisible);
    console.log(this.isCollapsed);
  }

  getVehicleCount() {
    this.apiService.getVehiclesOfOwner(this.userDetails?.ownerID).subscribe((data: any) => {
      console.log(data);
      sessionStorage.setItem('vehiclesCount', data.length);
      if(data.length == 0 && this.menuItemsTop.length == 3){
        this.menuItemsTop.splice(0, 1);
        this.setSelectedItem({
          index: 0,
          list: 'top'
        });
        this.router.navigate(['/home/vehicles']);
      }
      else{
        if(this.menuItemsTop.length == 2){
          this.menuItemsTop.splice(0, 0, {
            name: "Dashboard",
            link: "/home",
            icon: "../assets/images/home-smile-angle-svgrepo-com.svg",
            selected: true,
          });
          console.log(this.menuItemsTop);
        }
        this.menuItemsTop.forEach(element => {
          if(window.location.href.includes(element.link)){
            element.selected = true;
            this.selectedItem = {
              index: this.menuItemsTop.indexOf(element),
              list: 'top'
            };
            // set other items to false
            this.menuItemsTop.forEach(item => {
              if(item.name != element.name){
                item.selected = false;
              }
            });
            return;
          }
        });
        this.menuItemsBottom.forEach(element => {
          if(window.location.href.includes(element.link)){
            element.selected = true;
            this.selectedItem = {
              index: this.menuItemsBottom.indexOf(element),
              list: 'bottom'
            };
            // set other items to false
            this.menuItemsBottom.forEach(item => {
              if(item.name != element.name){
                item.selected = false;
              }
            });
            return;
          }
        });
      }
    });
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
    console.log(this.isCollapsed);
    let classes = 'flex flex-col h-screen bg-blue-50 border-r border-gray-300 transition-all duration-200 mob-zindex-sidebar col-mob';
    // classes += this.isCollapsed ? ' w-16' : '';
    classes += this.isLeftVisible ? ' visible' : ' hidden md:block';
    classes += this.isCollapsed ? ' hidden md:visible md:w-16' : ' w-3/5 md:w-64';
    return classes;
  }

  handleCollapse() {
    console.log("handle collapse" + this.isCollapsed);
    this.isCollapsed = !this.isCollapsed;
    console.log(this.isCollapsed);
    console.log(this.isLeftVisible);
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
}
