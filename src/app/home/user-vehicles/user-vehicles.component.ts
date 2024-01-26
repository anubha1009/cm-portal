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
        width: '50%' // expanded width
      })),
      transition('collapsed <=> expanded', [
        animate('0.5s')
      ]),
    ])
  ]
})
export class UserVehiclesComponent {

  ownerDetails: any;
  vehiclesCount = 0;
  extendedView = 'collapsed';
  vin: any;

  toggleView() {
    this.extendedView = this.extendedView === 'collapsed' ? 'expanded' : 'collapsed';
  }

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

  addVehicle(){
    console.log("Add vehicle");
  }

  checkVinLength(event: any) {
    if (event.target.value.length === 17) {
      console.log("VIN length is 17");
      this.getVehicleDetailsByVin(event.target.value);
    }
  }

  getVehicleDetailsByVin(vin: string) {
    this.apiService.decodeVin(vin).subscribe((data: any) => {
      const resultArray = data.Results;
      // for each result, find Variable key and Value key values and store as Variable: Value
      const vehicleDetails = resultArray.reduce((acc: any, curr: any) => {
        if(curr?.Value != null ){
          acc[curr?.Variable] = curr?.Value as string;
          return acc;
        }
        else{
          return acc;
        }
      }, {});
      console.log(vehicleDetails); 

      const vehicle = {
        make: vehicleDetails['Make'],
        model: vehicleDetails['Model'],
        year: vehicleDetails['Model Year'],
        vin: this.vin,
      }
      console.log(vehicle);
    });
  }

}
