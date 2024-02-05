import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserDashboardComponent } from './user-dashboard/user-dashboard.component';
import { SidebarComponent } from '../shared/sidebar/sidebar.component';
import { SharedModule } from '../shared/shared.module';
import { HomeRoutingModule } from './home-routing.module';
import { HomeComponent } from './home/home.component';
import { ToastrModule } from 'ngx-toastr';
import { UpdateVehicleDialog, UserVehiclesComponent } from './user-vehicles/user-vehicles.component';
import { VehicleDetailsComponent } from './user-vehicles/vehicle-details/vehicle-details.component';



@NgModule({
  declarations: [
    UserDashboardComponent,
    SidebarComponent,
    HomeComponent,
    UserVehiclesComponent,
    UpdateVehicleDialog,
    VehicleDetailsComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    HomeRoutingModule
  ]
})
export class HomeModule { }
