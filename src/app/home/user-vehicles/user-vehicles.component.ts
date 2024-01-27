import { Component } from '@angular/core';
import { AuthService } from '../../auth.service';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { ApiService } from '../../api.service';

@Component({
  selector: 'app-user-vehicles',
  standalone: false,
  templateUrl: './user-vehicles.component.html',
  styleUrls: ['./user-vehicles.component.css'],
  animations: [
    trigger('expandShrink', [
      state('collapsed', style({
        width: '*' // default width
      })),
      state('expanded', style({
        width: '60%' // expanded width
      })),
      transition('expanded <=> collapsed', [
        animate('0.5s')
      ]),
    ]),
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms', style({ opacity: 1 })),
      ]),
    ]),
    trigger('fadeOut', [
      transition(':leave', [
        animate('300ms', style({ opacity: 0 }))
      ])
    ]),
    //slide from top
    trigger('slideFromTop', [
      transition(':enter', [
        style({ transform: 'translateY(-100%)' }),
        animate('500ms', style({ transform: 'translateY(0)' })),
      ]),
    ]),
    //exit to top
    trigger('exitToTop', [
      transition(':leave', [
        animate('500ms', style({ transform: 'translateY(-100%)' }))
      ])
    ]),
  ]
})
export class UserVehiclesComponent {

  ownerDetails: any;
  vehiclesCount = 0;
  extendedView = 'collapsed';
  vin: any;
  showVinForm = false;
  vehicle: Vehicle = {} as Vehicle;

  constructor(private authService: AuthService, private apiService: ApiService) { 
    this.ownerDetails = JSON.parse(this.authService.getUserDetails()!);
    this.vehiclesCount = sessionStorage.getItem('vehiclesCount') ? parseInt(sessionStorage.getItem('vehiclesCount')!) : 0;

    if(this.vehiclesCount == 0){
      this.authService.setRoute({
        index: 0,
        list: 'top'
      });
    }
    else{
      this.authService.setRoute({
        index: 1,
        list: 'top'
      });
    }
  }

  toggleView() {
    // this.extendedView = this.extendedView === 'collapsed' ? 'expanded' : 'collapsed';
    this.showVinForm = !this.showVinForm;
  }

  handleVinBlur(){
    if(!this.vin){
      this.showVinForm = false;
    }
  }

  addVehicle(){
    console.log("Add vehicle");
  }

  closeVehicleDetails() {
    this.extendedView = 'collapsed';
    this.vin = '';
  }

  checkVinLength(event: any) {
    if (event.target.value.length === 17) {
      console.log("VIN length is 17");
      
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
        if(curr?.Value != null ){
          acc[curr?.Variable] = curr?.Value as string;
          this.extendedView = 'expanded';
          return acc;
        }
        else{
          return acc;
        }
      }, {});
      console.log(vehicleDetails);
      const image = await this.getVehicleImage(vehicleDetails['Make'] + ' ' + vehicleDetails['Model']);
      const type = vehicleDetails['Body Class'] || vehicleDetails['Vehicle Type'];
      // Sport Utility Vehicle (SUV)/Multi-Purpose Vehicle (MPV)
      // extract SUV/MPV from type
      // check if type contains '/' and '()'
      if(type.includes('(') && type.includes(')')){
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
          displacement: vehicleDetails['Displacement (L)']+ 'L',
          horsepower: vehicleDetails['Engine Brake (hp) To'],
          engine: vehicleDetails['Engine Configuration'],
          cylinders: vehicleDetails['Engine Number of Cylinders'],
          fuel: vehicleDetails['Fuel Type - Primary'],
        },
        make: vehicleDetails['Make'],
        model: vehicleDetails['Model'],
        year: vehicleDetails['Model Year'],        
        vin: this.vin,        
        image: image,        
      }
      console.log(this.vehicle);
    });
  }

}

export interface Vehicle {
  body: {
    doors: string,
    series: string,
    trim: string,
    type: string,
  },
  engine: {
    displacement: string,
    horsepower: string,
    engine: string,
    cylinders: string,
    fuel: string,
  },
  make: string,
  model: string,
  year: string,
  vin: string,
  image: string,
}
