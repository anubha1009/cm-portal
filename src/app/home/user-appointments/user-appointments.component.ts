import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../api.service';
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';

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

  constructor(private apiService: ApiService) {    
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
      // console.log(this.appointments);
    },
    (error: any) => {
      // console.log(error);
    })
  }

  getOwnerVehicles(){
    this.apiService.getVehiclesOfOwner(this.owner.ownerID).subscribe((response: any) => {
      this.vehicles = response;
    }, (error: any) => {
      console.log(error);
    })
  }

  setProviderNames(){
    this.apiService.getAllProviders().then((response: any) => {
      this.providers = response;
      // console.log(this.providers);
    })
  }

  trackbyAppointmentId(index: number, appointment: any) {
    return appointment.appointmentID;
  }

  selectAppointment(appointment: any) {
    this.selectedAppointment = appointment;
    this.extendedView = 'expanded';
  }
}
