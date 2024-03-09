import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UserDashboardComponent } from './user-dashboard/user-dashboard.component';
import { HomeComponent } from './home/home.component';
import { UserVehiclesComponent } from './user-vehicles/user-vehicles.component';
import { UserAppointmentsComponent } from './user-appointments/user-appointments.component';
import { UserProfileComponent } from './user-profile/user-profile.component';

const routes: Routes = [
    { 
        path: '', component: HomeComponent,
        children: [
            // {path: '', component: UserDashboardComponent},
            // redirect undefined paths to vehicles
            {path: '', redirectTo: 'vehicles', pathMatch: 'full'},
            {path: 'vehicles', component: UserVehiclesComponent},
            {path: 'appointments', component: UserAppointmentsComponent},
            {path: 'profile', component: UserProfileComponent},
        ]
    }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomeRoutingModule { }