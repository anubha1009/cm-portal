import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UserDashboardComponent } from './user-dashboard/user-dashboard.component';
import { HomeComponent } from './home/home.component';
import { UserVehiclesComponent } from './user-vehicles/user-vehicles.component';

const routes: Routes = [
    { 
        path: '', component: HomeComponent,
        children: [
            {path: '', component: UserDashboardComponent},
            {path: 'vehicles', component: UserVehiclesComponent},
        ]
    }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomeRoutingModule { }