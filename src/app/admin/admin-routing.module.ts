import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminComponent } from './admin/admin.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { AdminAppointmentsComponent } from './admin-appointments/admin-appointments.component';
import { AdminProvidersComponent } from './admin-providers/admin-providers.component';
import { AdminProfileComponent } from './admin-profile/admin-profile.component';
import { superAdminGuard } from '../super-admin.guard';

const routes: Routes = [
  { 
    path: '', component: AdminComponent,
    children: [
      {path: 'manager', component: AdminDashboardComponent, canActivate: [superAdminGuard]},
      {path: 'appointments', component: AdminAppointmentsComponent},
      {path: 'providers', component: AdminProvidersComponent},
      {path: 'profile', component: AdminProfileComponent},
      // wildcard route
      {path: '**', redirectTo: 'providers'}
    ]
}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
