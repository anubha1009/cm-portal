import { animate, style, transition, trigger } from '@angular/animations';
import { Component, EventEmitter, Inject, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { ApiService } from '../../../api.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { AuthService } from '../../../auth.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-appointment-details',
  standalone: false,
  templateUrl: './appointment-details.component.html',
  styleUrl: './appointment-details.component.css',
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms', style({ opacity: 1 })),
      ]),
    ]),
    trigger('fadeOut', [
      transition(':leave', [animate('300ms', style({ opacity: 0 }))]),
    ]),
  ],
})
export class AppointmentDetailsComponent implements OnChanges {

  @Input() appointment: any;
  @Output() close = new EventEmitter<any>();

  constructor(private apiService: ApiService,
    private toastr: ToastrService,
    private router: Router,
    public dialog: MatDialog,
    private authService: AuthService) { 

  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes['appointment'].currentValue){
      this.appointment = changes['appointment'].currentValue;
    }

    console.log(this.appointment);
  }

  goBack(){;
    this.close.emit('back');
  }

  toggleUpdateDialog() {
    console.log(this.appointment);
    const dialogRef = this.dialog.open(UpdateAppointmentDialog, {
      data: this.appointment,
      maxWidth: '100%',
      height: 'auto',
      hasBackdrop: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.toastr.success(result);
        this.close.emit('update');
      }
      else{
        this.toastr.error('Appointment not updated');
      }
    });
  }

  toggleCancelDialog() {
    const dialogRef = this.dialog.open(CancelAppointmentDialog, {
      data: this.appointment,
      maxWidth: '100%',
      height: 'auto',
      hasBackdrop: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.toastr.success(result);
        this.close.emit('cancel');
      }
      else{
        this.toastr.error('Appointment is not Cancelled');
      }
    });
  }
}



@Component({
  selector: 'update-appointment-dialog',
  template: `
    <div class="p-4 bg-purple-500 bg-opacity-50  backdrop-blur-lg lg:backdrop-blur border-s-custom-purple-l-translucent">
      <h4
        class="display-6 text-purple-950 font-thin ms-3"
        id="modal-basic-title"
      >
        Update Appointment
      </h4>
      <div class="flex w-full mt-3 gap-4 flex-col lg:flex-row">
        <div
          class="flex flex-grow-1 text-xl font-thin items-center"
        >
          <form
            [formGroup]="updateAppointmentForm"
            class="w-full"
            (ngSubmit)="onUpdate()"
          >
            <mat-form-field class="w-full">
              <mat-label>Appointment Date</mat-label>
              <input
                matInput type="datetime-local"
                [min]="today.toISOString().slice(0, 16)"
                [value]="today.toISOString().slice(0, 16)"
                formControlName="appointmentDate"
              />
            </mat-form-field>

            <mat-form-field class="w-full">
              <mat-label>Service Type</mat-label>
              <mat-select formControlName="serviceType">
                <mat-option *ngFor="let service of services" [value]="service.serviceName">
                  {{ service.serviceName }}
                </mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field class="w-full">
              <mat-label>Vehicle</mat-label>
              <mat-select formControlName="vehicleID">
                <mat-option *ngFor="let vehicle of data.vehicles" [value]="vehicle.vehicleID">
                  {{ vehicle?.year + ' ' + vehicle?.make + ' ' + vehicle?.model }}
                </mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field class="w-full">
              <mat-label>Provider</mat-label>
              <mat-select formControlName="providerID">
                <mat-option *ngFor="let provider of data.providers" [value]="provider.providerID">
                  {{provider?.name}} - {{provider?.address}}
                </mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field class="w-full">
              <mat-label>Additional Notes</mat-label>
              <input
                matInput
                type="text"
                formControlName="notes"
                placeholder="Any Additional Notes?"
              />
            </mat-form-field>
          </form>
        </div>

        <div mat-dialog-actions class="flex flex-row lg:flex-col flex-grow-1 justify-center items-center lg:ms-auto">
          <button
            type="button"
            [disabled]="!updateAppointmentForm.valid"
            class="bg-purple-700 text-white font-thin text-lg rounded-lg p-3 hover:bg-purple-800 w-full"
            (click)="updateAppointment()"
          >
            Update
          </button>
          <button
            type="button"
            class="bg-rose-600 text-white font-thin text-lg rounded-lg p-3 hover:bg-rose-700 w-full mt-3"
            (click)="close('')"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  `,
})
export class UpdateAppointmentDialog {
  updateAppointmentForm = new FormGroup({
    appointmentID: new FormControl(''),
    appointmentDate: new FormControl('', [Validators.required]),
    vehicleID: new FormControl('', [Validators.required]),
    serviceType: new FormControl('', [Validators.required]),
    providerID: new FormControl('', [Validators.required]),
    notes: new FormControl(''),
  });

  today: Date = new Date();

  services: any[] = [
    {serviceID: 1, serviceName: 'Oil Change'},
    {serviceID: 2, serviceName: 'Tire Rotation'},
    {serviceID: 3, serviceName: 'Brake Service'},
    {serviceID: 4, serviceName: 'Transmission Service'},
    {serviceID: 5, serviceName: 'Engine Service'},
    {serviceID: 6, serviceName: 'Battery Service'},
    {serviceID: 7, serviceName: 'Coolant Service'},
    {serviceID: 8, serviceName: 'Air Filter Service'},
    {serviceID: 9, serviceName: 'Cabin Filter Service'},
    {serviceID: 10, serviceName: 'Wiper Blade Service'},
  ];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public modal: MatDialogRef<UpdateAppointmentDialog>,
    private apiService: ApiService,
    private authService: AuthService
  ) {
    this.updateAppointmentForm.setValue({
      appointmentID: this.data.appointment.appointmentID,
      appointmentDate: this.data.appointment.appointmentDate,
      vehicleID: this.data.appointment.vehicleID,
      serviceType: this.data.appointment.serviceType,
      providerID: this.data.appointment.providerID,
      notes: this.data.appointment.notes
    })
  }

  onUpdate() {
    if (this.updateAppointmentForm.valid) {
      this.updateAppointment();
    }
  }

  updateAppointment() {
    let today = new Date();
    let todayString = today.toISOString();
    let appointmentID = this.updateAppointmentForm.value.appointmentID;

    let obj={
      appointmentDate: this.updateAppointmentForm.value.appointmentDate,
      vehicleID: this.updateAppointmentForm.value.vehicleID,
      serviceType: this.updateAppointmentForm.value.serviceType,
      providerID: this.updateAppointmentForm.value.providerID,
      notes: this.updateAppointmentForm.value.notes,
      appointmentStatus: 'Open',
      lastUpdate: todayString
    } 
    
    this.apiService.updateAppointmentForOwner(obj, appointmentID).subscribe((response: any) => {
      this.close(response.message)
    },
    (error: any) => {
      this.close('')
    }
    )
  }

  close(value: string) {
    this.modal.close(value);
  }
}


@Component({
  selector: 'cancel-appointment-dialog',
  template: `
    <div class="p-4 bg-purple-500 bg-opacity-50 backdrop-blur-lg lg:backdrop-blur border-s-custom-purple-l-translucent">
      <h4
        class="display-6 text-purple-950 font-thin"
        id="modal-basic-title"
      >
        Cancel Appointment?
      </h4>
      <div class="flex w-full mt-3 gap-4 flex-col lg:flex-row">
        <div
          class="flex flex-grow-1 text-xl font-thin items-center text-white"
        >
          Are you sure you want to cancel this appointment?
        </div>
        <div mat-dialog-actions class="flex flex-row lg:flex-col flex-grow-1 justify-center items-center lg:ms-auto">
          <button
            type="button"
            class="bg-rose-600 text-white font-thin text-lg rounded-lg p-3 me-5 hover:bg-rose-700"
            (click)="cancelAppointment()"
          >
            Cancel Appointment
          </button>
          <button
            type="button"
            class="bg-purple-700 text-white font-thin text-lg rounded-lg p-3 hover:bg-purple-800"
            (click)="close(false)"
          >
            Close Dialog
          </button>
        </div>
      </div>
    </div>
  `,
})
export class CancelAppointmentDialog {
  constructor(
    public modal: MatDialogRef<CancelAppointmentDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private apiService: ApiService,
    private authService: AuthService
  ) {
    console.log(data);
  }

  cancelAppointment() {
    let today = new Date();
    let todayString = today.toISOString();
    let obj = {
      appointmentStatus: 'Cancelled',
      lastUpdate: todayString,
      appointmentDate: this.data.appointment.appointmentDate,
      vehicleID: this.data.appointment.vehicleID,
      serviceType: this.data.appointment.serviceType,
      providerID: this.data.appointment.providerID,
      notes: this.data.appointment.notes
    }
    this.apiService
      .updateAppointmentForOwner(obj, this.data.appointment.appointmentID)
      .subscribe((response: any) => {
        if (response) {
          this.authService.setLink('appointments');
          this.close(true);
        }
      });
  }

  close(value: boolean) {
    this.modal.close(value);
  }
}
