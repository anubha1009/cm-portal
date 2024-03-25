import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { ApiService } from '../../api.service';
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { AuthService } from '../../auth.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-user-appointments',
  standalone: false,
  templateUrl: './user-appointments.component.html',
  styleUrl: './user-appointments.component.css',
  animations: [
    trigger('expandShrink', [
      state(
        'collapsed',
        style({
          width: '*', // default width
        })
      ),
      state(
        'expanded',
        style({
          width: '*', // expanded width
        })
      ),
      transition('expanded <=> collapsed', [animate('0.5s')]),
    ]),
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms', style({ opacity: 1 })),
      ]),
    ]),
    trigger('fadeOut', [
      transition(':leave', [animate('300ms', style({ opacity: 0 }))]),
    ]),
    trigger('slideInOut', [
      transition(':enter', [
        style({ opacity: 0 , height: '0'}),
        animate('100ms', style({ height: '*'})),
        animate('100ms', style({ margin: '*'})),
        animate('100ms', style({ padding: '*'})),
        animate('100ms', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        style({ opacity: 1, height: '*'}),
        animate('100ms', style({ opacity: 0 })),
        animate('100ms', style({ padding: 0})),
        animate('100ms', style({ margin: 0})),
        animate('100ms', style({ height: 0 }))
      ])
    ])
  ],
})
export class UserAppointmentsComponent implements OnInit{
  owner: any;
  appointments: any[] = [];
  providers: any[] = [];
  addButtonClicked: boolean = false;
  editButtonClicked: boolean = false;
  seeDetailsButtonClicked: boolean = false;
  detailObject: any;
  today: Date = new Date();
  vehicles: any[] = [];
  deletedAppointment: any;
  extendedView = 'collapsed';
  selectedAppointment: any = {};
  @Output() close = new EventEmitter<any>();

  constructor(private apiService: ApiService, public dialog: MatDialog, private toastr: ToastrService) {    
    this.owner = JSON.parse(sessionStorage.getItem('owner')!);
  }

  ngOnInit(): void {
    this.getAppointmentsOfOwner();
    this.getOwnerVehicles();
  }


  getAppointmentsOfOwner(){
    this.apiService.getAppointmentsOfOwner(this.owner.ownerID).subscribe((response: any) => {
      this.appointments = response;
      this.setProviderNames();
      //console.log(this.appointments);
    },
    (error: any) => {
      // //console.log(error);
    })
  }

  getOwnerVehicles(){
    this.apiService.getVehiclesOfOwner(this.owner.ownerID).subscribe((response: any) => {
      this.vehicles = response;
    }, (error: any) => {
      //console.log(error);
    })
  }

  setProviderNames(){
    this.apiService.getAllProviders().then((response: any) => {
      this.providers = response;
      // //console.log(this.providers);
    })
  }

  trackbyAppointmentId(index: number, appointment: any) {
    return appointment.appointmentID;
  }

  selectAppointment(appointment: any) {
    let obj = {
      appointment: appointment,
      vehicles: this.vehicles,
      providers: this.providers
    }
    this.selectedAppointment = obj;
    this.extendedView = 'expanded';
  }

  toggleView() {
    let obj = {
      vehicles: this.vehicles,
      providers: this.providers
    }
    const dialogRef = this.dialog.open(AddAppointmentDialog, {
      data: obj,
      maxWidth: '100%',
      height: 'auto',
      hasBackdrop: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.toastr.success(result);
        this.close.emit('scheduled');
        this.getAppointmentsOfOwner();
      }
      else{
        this.toastr.error('Appointment not scheduled');
      }
    });
  }

  closeAppointmentDetailsUser(event: any) {
    //console.log(event);
    if(event === 'back'){
      this.extendedView = 'collapsed';
      this.selectedAppointment = {};
    }
    if (event === 'cancel' || event === 'update') {
      this.getAppointmentsOfOwner();
      this.extendedView = 'collapsed';
      this.selectedAppointment = {};
    }
  }
}

@Component({
  selector: 'add-appointment-dialog',
  template: `
    <div class="p-4 bg-purple-500 bg-opacity-50  backdrop-blur-lg lg:backdrop-blur border-s-custom-purple-l-translucent">
      <h4
        class="display-6 text-purple-950 font-thin ms-3"
        id="modal-basic-title"
      >
        Schedule Appointment
      </h4>
      <div class="flex w-full mt-3 gap-4 flex-col lg:flex-row">
        <div
          class="flex flex-grow-1 text-xl font-thin items-center"
        >
          <form
            [formGroup]="scheduleAppointmentForm"
            class="w-full"
            (ngSubmit)="onSchedule()"
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
            [disabled]="!scheduleAppointmentForm.valid"
            class="bg-purple-700 text-white font-thin text-lg rounded-lg p-3 hover:bg-purple-800 w-full"
            (click)="scheduleAppointment()"
          >
            Schedule
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
export class AddAppointmentDialog {
  scheduleAppointmentForm = new FormGroup({
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
    public modal: MatDialogRef<AddAppointmentDialog>,
    private apiService: ApiService,
    private authService: AuthService
  ) {
  }

  onSchedule() {
    if (this.scheduleAppointmentForm.valid) {
      this.scheduleAppointment();
    }
  }

  scheduleAppointment() {
    let obj={
      appointmentDate: this.scheduleAppointmentForm.value.appointmentDate,
      vehicleID: this.scheduleAppointmentForm.value.vehicleID,
      serviceType: this.scheduleAppointmentForm.value.serviceType,
      providerID: this.scheduleAppointmentForm.value.providerID,
      notes: this.scheduleAppointmentForm.value.notes,
      appointmentStatus: 'Open',
      lastUpdate: ''
    }
    this.apiService.addAppointmentForOwner(obj).subscribe((response: any) => {
      this.close(response.message)
    }, (error: any) => {
      this.close('')
    }
    )
  }

  close(value: string) {
    this.modal.close(value);
  }
}
