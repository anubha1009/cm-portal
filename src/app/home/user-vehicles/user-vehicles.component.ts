import { Component, Inject } from '@angular/core';
import { AuthService } from '../../auth.service';
import { animate, state, style, transition, trigger } from '@angular/animations';
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
import {MatButtonModule} from '@angular/material/button';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';

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

  vehicles: any = [];
  ownerDetails: any;
  vehiclesCount = 0;
  extendedView = 'collapsed';
  vin: any;
  showVinForm = false;
  vehicle: Vehicle = {} as Vehicle;

  constructor(private authService: AuthService, private apiService: ApiService, 
    private toastr: ToastrService, private router: Router, public dialog: MatDialog) { 
    this.ownerDetails = JSON.parse(this.authService.getUserDetails()!);
    this.vehiclesCount = sessionStorage.getItem('vehiclesCount') ? parseInt(sessionStorage.getItem('vehiclesCount')!) : 0;

    if(this.vehiclesCount == 0){
      this.authService.setRoute({
        index: 0,
        list: 'top'
      });
    }
    else{
      this.getVehiclesOfOwner();
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
    }
    this.apiService.addVehicleForOwner(vehicle).subscribe((data: any) => {
      this.authService.setLink('vehicles')
      this.showVinForm = false;
      this.extendedView = 'collapsed';
      this.toastr.success('Vehicle added successfully', 'Success');
      this.getVehiclesOfOwner();
    }
    );
  }

  getVehiclesOfOwner(){
    this.apiService.getVehiclesOfOwnerWithMR(this.ownerDetails.ownerID).subscribe((response: any) => {
      this.vehicles = response;
    }, (error: any) => {
      console.log(error);
    })
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

  openDeleteDialog(vehicle: any){
    const dialogRef = this.dialog.open(DeleteVehicleDialog, {
      data: vehicle,
      width: '60%',
      height: 'auto',
      hasBackdrop: true,
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result){
        this.getVehiclesOfOwner();
      }
    });
  }

}

@Component({
  selector: 'delete-vehicle-dialog',
  template: `
  <div class="p-4 rounded-3xl">
    <h4 mat-dialog-title class="display-6 text-purple-800 font-thin" id="modal-basic-title">Delete Vehicle?</h4>
    <div class="flex w-full mt-3">
      <div mat-dialog-content class="flex flex-grow-1 text-xl font-thin items-center">
        Are you sure you want to delete this vehicle? - {{data?.make}} {{data?.model}} {{data?.year}}
      </div>
      <div mat-dialog-actions class="flex flex-grow-1 justify-end ms-auto">
        <button type="button" class="bg-rose-500 text-white font-thin text-lg rounded-lg p-3 me-5 hover:bg-rose-600" (click)="deleteVehicle()">Delete</button>
        <button type="button" class="bg-purple-500 text-white font-thin text-lg rounded-lg p-3 hover:bg-purple-600" (click)="close(false)">Cancel</button>
      </div>
    </div>
  </div>
  `
})

export class DeleteVehicleDialog {
  constructor(public modal: MatDialogRef<DeleteVehicleDialog>, @Inject(MAT_DIALOG_DATA) public data: any, 
  private apiService: ApiService, private authService: AuthService) {
    console.log(data);
  }

  deleteVehicle(){
    this.apiService.deleteVehicleForOwner(this.data.vehicleID).subscribe((response: any) => {
      if(response){
        this.authService.setLink('vehicles')
        this.close(true);
      }
    })
  }

  close(value: boolean){
    this.modal.close(value);
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
