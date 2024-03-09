import { Component, Inject } from '@angular/core';
import { AuthService } from '../../auth.service';
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { ApiService } from '../../api.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import {
  MatDialog,
  MatDialogRef,
  MatDialogActions,
  MatDialogClose,
  MatDialogTitle,
  MatDialogContent,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-user-vehicles',
  standalone: false,
  templateUrl: './user-vehicles.component.html',
  styleUrls: ['./user-vehicles.component.css'],
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
export class UserVehiclesComponent {
  vehicles: any = [];
  ownerDetails: any;
  vehiclesCount = 0;
  extendedView = 'collapsed';
  vin: any;
  showVinForm = false;
  vehicle: Vehicle = {} as Vehicle;
  selectedVehicle: any = {};

  constructor(
    private authService: AuthService,
    private apiService: ApiService,
    private toastr: ToastrService,
    private router: Router,
    public dialog: MatDialog
  ) {
    this.ownerDetails = JSON.parse(this.authService.getUserDetails()!);
    this.vehiclesCount = sessionStorage.getItem('vehiclesCount')
      ? parseInt(sessionStorage.getItem('vehiclesCount')!)
      : 0;

    if (this.vehiclesCount == 0) {
      this.authService.setRoute({
        index: 0,
        list: 'top',
      });
    } else {
      this.getVehiclesOfOwner();
      this.authService.setRoute({
        // index: 1,
        index: 0,
        list: 'top',
      });
    }
  }

  toggleView() {
    // this.extendedView = this.extendedView === 'collapsed' ? 'expanded' : 'collapsed';
    this.showVinForm = !this.showVinForm;
  }

  handleVinBlur() {
    if (!this.vin) {
      this.showVinForm = false;
    }
  }

  addVehicle() {
    const vehicle = {
      VIN: this.vin,
      ownerID: this.ownerDetails.ownerID,
      make: this.vehicle.make,
      model: this.vehicle.model,
      year: this.vehicle.year,
      mileage: 0,
      mileageDate: new Date().toISOString().slice(0, 10),
      licensePlate: '',
      state: '',
    };
    this.apiService.addVehicleForOwner(vehicle).subscribe((data: any) => {
      this.authService.setLink('vehicles');
      this.showVinForm = false;
      this.extendedView = 'collapsed';
      this.toastr.success('Vehicle added successfully', 'Success');
      this.getVehiclesOfOwner();
    });
  }

  getVehiclesOfOwner() {
    this.apiService
      .getVehiclesOfOwnerWithMR(this.ownerDetails.ownerID)
      .subscribe(
        (response: any) => {
          this.vehicles = response;
        },
        (error: any) => {
          console.log(error);
        }
      );
  }

  closeVehicleDetails() {
    this.extendedView = 'collapsed';
    this.vin = '';
  }

  closeVehicleDetailsUser(event: any) {
    console.log(event);
    if (event === 'back') {
      this.extendedView = 'collapsed';
      this.selectedVehicle = {};
      this.vin = '';
    }
    if (event === 'delete' || event === 'update') {
      this.getVehiclesOfOwner();
      this.extendedView = 'collapsed';
      this.selectedVehicle = {};
      this.vin = '';
    }
  }

  checkVinLength(event: any) {
    if (event.target.value.length === 17) {
      console.log('VIN length is 17');

      this.getVehicleDetailsByVin(event.target.value);
    }
  }

  async getVehicleImage(query: string): Promise<string> {
    const data = await this.apiService.getvehicleImage(query);
    const resultArray = data['results'];
    console.log(resultArray[0].urls.regular);
    return resultArray[0].urls.regular as string;
  }

  getVehicleDetailsByVin(vin: string) {
    this.apiService.decodeVin(vin).subscribe(async (data: any) => {
      const resultArray = data.Results;
      let vehicleDetails = resultArray.reduce((acc: any, curr: any) => {
        if (curr?.Value != null) {
          acc[curr?.Variable] = curr?.Value as string;
          this.extendedView = 'expanded';
          return acc;
        } else {
          return acc;
        }
      }, {});
      console.log(vehicleDetails);
      const image = await this.getVehicleImage(
        vehicleDetails['Make'] + ' ' + vehicleDetails['Model']
      );
      const type =
        vehicleDetails['Body Class'] || vehicleDetails['Vehicle Type'];
      if (type.includes('(') && type.includes(')')) {
        const typeArray = type.split('(');
        const typeArray2 = typeArray[1].split(')');
        vehicleDetails['Body Class'] = typeArray2[0];
      }

      this.vehicle = {
        body: {
          doors: vehicleDetails['Doors'],
          series: vehicleDetails['Series'],
          trim: vehicleDetails['Trim'],
          type: vehicleDetails['Body Class'],
        },
        engine: {
          displacement: vehicleDetails['Displacement (L)'] + 'L',
          horsepower: vehicleDetails['Engine Brake (hp) To'],
          engine: vehicleDetails['Engine Configuration'],
          cylinders: vehicleDetails['Engine Number of Cylinders'],
          fuel: vehicleDetails['Fuel Type - Primary'],
        },
        make: vehicleDetails['Make'],
        model: vehicleDetails['Model'],
        year: vehicleDetails['Model Year'],
        VIN: this.vin,
        image: image,
      };
      console.log(this.vehicle);
    });
  }

  trackbyVehicleId(index: number, vehicle: any) {
    return vehicle.vehicleID;
  }

  selectVehicle(vehicle: any) {
    this.selectedVehicle = vehicle;
    this.extendedView = 'expanded';
  }
}

export interface Vehicle {
  body: {
    doors: string;
    series: string;
    trim: string;
    type: string;
  };
  engine: {
    displacement: string;
    horsepower: string;
    engine: string;
    cylinders: string;
    fuel: string;
  };
  make: string;
  model: string;
  year: string;
  VIN: string;
  image: string;
  maintenanceRecords?: [] | any;
  licensePlate?: string;
  state?: string;
  mileage?: number;
  mileageDate?: string;
  vehicleID?: string;  
}
