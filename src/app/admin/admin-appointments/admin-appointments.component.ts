import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable, map, startWith } from 'rxjs';
import { ApiService } from '../../api.service';
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';

@Component({
  selector: 'app-admin-appointments',
  standalone: false,
  templateUrl: './admin-appointments.component.html',
  styleUrl: './admin-appointments.component.css',
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
export class AdminAppointmentsComponent implements OnInit {

  providerCtrl = new FormControl();
  filteredProviders: Observable<any[]>;
  providers: any[] = [];
  extendedView: string = 'collapsed';
  appointments: any[] = [];
  selectedAppointment: any = {};

  constructor(private apiService: ApiService) {
    this.getProviders();
    this.providerCtrl = new FormControl();
    this.filteredProviders = this.providerCtrl.valueChanges.pipe(
      startWith(''),
      map((provider: any) => (provider ? this.filterProviders(provider) : this.providers.slice()))
    );
  }

  ngOnInit(): void {
    this.providerCtrl.valueChanges.subscribe(value => {
      this.getAppointments();
    });
  }

  async getProviders() {
    await this.apiService.getAllProviders().then((data: any) => {
      this.providers = data;
      // sort based on providers.name
      this.providers.sort((a: any, b: any) => {
        return a.name.localeCompare(b.name);
      });
    },
    (error) => {
      console.log(error);
    });
  }

  filterProviders(name: any) {
    let arr = this.providers.filter((provider) => provider.name.toLowerCase().indexOf(name.toLowerCase()) === 0);
    return arr.length ? arr : [{providerID: null, name: "No provider found"}];
  }

  onFocus() {
    this.providerCtrl.setValue(this.providerCtrl.value || '');
  }

  displayProviderFn(providerId: string): string {
    const provider = this.providers.find(p => p.providerID === providerId);
    return provider ? `${provider.name} | ${provider.address}` : '';
  }

  getAppointments() {
    if (this.providerCtrl.value) {
      console.log(this.providerCtrl.value);
      this.apiService.getAppointmentsOfProvider(this.providerCtrl.value).subscribe((data: any) => {
        this.appointments = data.sort((a: any, b: any) => {
          // Sort by status first: Open > Closed > Cancelled
          const statusOrder: { [key: string]: number } = { 'Open': 1, 'Closed': 2, 'Cancelled': 3 };
          if (statusOrder[a.appointmentStatus] < statusOrder[b.appointmentStatus]) return -1;
          if (statusOrder[a.appointmentStatus] > statusOrder[b.appointmentStatus]) return 1;
      
          // If statuses are the same, sort by appointmentDate
          const dateA = new Date(a.appointmentDate);
          const dateB = new Date(b.appointmentDate);
          return dateA.getTime() - dateB.getTime();
        });
      },
      (error) => {
        console.log(error);
      });
    }
    else{
      this.appointments = [];
    }
  }

  selectAppointment(appointment: any) {
    this.selectedAppointment = appointment;
    this.extendedView = 'expanded';
  }

  closeAppointmentDetails(event: any) {
    console.log(event);
    if(event === 'back'){
      this.extendedView = 'collapsed';
      this.selectedAppointment = {};
    }
    if (event === 'cancel' || event === 'update') {
      this.getAppointments();
      this.extendedView = 'collapsed';
      this.selectedAppointment = {};
    }
  }
}
