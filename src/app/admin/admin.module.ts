import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminRoutingModule } from './admin-routing.module';
import { SharedModule } from '../shared/shared.module';
import { AdminComponent } from './admin/admin.component';
import { AddAdminDialog, AdminDashboardComponent, DeleteAdminDialog } from './admin-dashboard/admin-dashboard.component';
import { AdminAppointmentsComponent } from './admin-appointments/admin-appointments.component';
import { AddProviderDialog, AdminProvidersComponent } from './admin-providers/admin-providers.component';
import { AdminProfileComponent } from './admin-profile/admin-profile.component';
import { ProviderDetailsComponent } from './admin-providers/provider-details/provider-details.component';
import { AppointmentDetailsComponent, CloseAppointmentDialog } from './admin-appointments/appointment-details/appointment-details.component';


@NgModule({
  declarations: [
    AdminComponent,
    AdminDashboardComponent,
    AdminAppointmentsComponent,
    AdminProvidersComponent,
    AdminProfileComponent,
    ProviderDetailsComponent,
    AddProviderDialog,
    AppointmentDetailsComponent,
    CloseAppointmentDialog,
    AddAdminDialog,
    DeleteAdminDialog
  ],
  imports: [
    CommonModule,
    SharedModule,
    AdminRoutingModule
  ]
})
export class AdminModule { }
