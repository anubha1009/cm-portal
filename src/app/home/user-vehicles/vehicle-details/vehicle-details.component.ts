import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { ApiService } from '../../../api.service';
import { animate, style, transition, trigger } from '@angular/animations';
import { Vehicle } from '../user-vehicles.component';

@Component({
  selector: 'app-vehicle-details',
  templateUrl: './vehicle-details.component.html',
  styleUrl: './vehicle-details.component.css',
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
export class VehicleDetailsComponent implements OnChanges{

  @Input() vehicle: Vehicle = {
    body: {
      doors: '',
      series: '',
      trim: '',
      type: ''
    },
    engine: {
      displacement: '',
      horsepower: '',
      engine: '',
      cylinders: '',
      fuel: ''
    },
    make: '',
    model: '',
    year: '',
    VIN: '',
    image: '',
    maintenanceRecords: [],
    licensePlate: '',
    state: '',
    mileage: 0,
    mileageDate: '',
    vehicleID: ''  
  };
  @Output() close = new EventEmitter<any>();

  constructor(private apiService: ApiService) { 

  }
  ngOnChanges(changes: SimpleChanges): void {
    if(changes['vehicle'].currentValue){
      this.vehicle = changes['vehicle'].currentValue;
      if(this.vehicle.VIN){
        this.getVehicleDetailsByVin(this.vehicle.VIN);
      }
    }

    console.log(this.vehicle);
  }

  goBack(){;
    this.close.emit('back');
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
        ...this.vehicle,
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
        image: image,
      };
      console.log(this.vehicle);
    });
  }

}
