import { Component } from '@angular/core';
import { SharedModule } from '../shared.module';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  standalone: false,
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css', '../../tail.css']
})
export class SidebarComponent {

  isLeftVisible = false;
  isCollapsed = false;
  selectedItem = { index: 0, list: 'top' };
  menuItemsTop = [
    {
      name: "Dashboard",
      link: "/#",
      icon: "../assets/images/home-smile-angle-svgrepo-com.svg",
      selected: true,
    },
    {
      name: "Vehicles",
      link: "/#",
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
    classes += this.isCollapsed ? ' w-16' : ' w-48';
    classes += this.isLeftVisible ? ' visible' : ' hidden';
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
