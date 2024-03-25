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
import e from 'express';

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
          //console.log(error);
        }
      );
  }

  closeVehicleDetails() {
    this.extendedView = 'collapsed';
    this.vin = '';
  }

  closeVehicleDetailsUser(event: any) {
    //console.log(event);
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
      //console.log('VIN length is 17');

      this.getVehicleDetailsByVin(event.target.value);
    }
  }

  async getVehicleImage(query: string): Promise<string> {
    const data = await this.apiService.getvehicleImage(query);
    const resultArray = data['results'];
    //console.log(resultArray[0].urls.regular);
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
      //console.log(vehicleDetails);
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
      //console.log(this.vehicle);
    });
  }

  trackbyVehicleId(index: number, vehicle: any) {
    return vehicle.vehicleID;
  }

  selectVehicle(vehicle: any) {
    this.selectedVehicle = vehicle;
    this.extendedView = 'expanded';
  }

  generateReport() {
    const dialogRef = this.dialog.open(ReportDialog, {
      maxWidth: '100%',
      height: 'auto',
      hasBackdrop: true,
      data: {
        ownerID: this.ownerDetails.ownerID,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if(result != ''){
        if(result === 'No Records' || result === 'Error'){
          if(result === 'No Records'){
            this.toastr.info('No records found for the selected date range');
          }
          if(result === 'Error'){
            this.toastr.error('Error downloading report');
          }
        }
        else{
          this.toastr.success(result);
        }
      }
      else{
        this.toastr.error('Report cancelled');
      }
    });
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

@Component({
  selector: 'report-dialog',
  template: `
    <div class="p-4 bg-purple-500 bg-opacity-50  backdrop-blur-lg lg:backdrop-blur border-s-custom-purple-l-translucent">
      <h4
        class="display-6 text-purple-950 font-thin ms-3"
        id="modal-basic-title"
      >
        Download Reports
      </h4>
      <div class="flex w-full mt-3 gap-4 flex-col lg:flex-row">
        <div
          class="flex flex-grow-1 text-xl font-thin items-center"
        >
          <form
            [formGroup]="reportForm"
            class="w-full"
          >
            <mat-form-field class="w-full">
              <mat-label>Start Date</mat-label>
              <input
                matInput
                formControlName="startDate"
                type="date"
              />
            </mat-form-field>
            <mat-form-field class="w-full">
              <mat-label>End Date</mat-label>
              <input
                matInput
                formControlName="endDate"
                type="date"
                max="{{ today }}"
              />
            </mat-form-field>
          </form>
        </div>

        <div mat-dialog-actions class="flex flex-row lg:flex-col flex-grow-1 justify-center items-center lg:ms-auto">
          <button
            type="button"
            [disabled]="!reportForm.valid"
            class="bg-purple-700 text-white font-thin text-lg rounded-lg p-3 hover:bg-purple-800 w-full"
            (click)="downloadReport()"
          >
            Download
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
export class ReportDialog {
  reportForm = new FormGroup({
    ownerID: new FormControl(''),
    startDate: new FormControl('', Validators.required),
    endDate: new FormControl('', Validators.required),
  });
  today = new Date().toISOString().slice(0, 10);

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public modal: MatDialogRef<ReportDialog>,
    private apiService: ApiService,
    private authService: AuthService
  ) {
    //console.log(data);
    this.reportForm.patchValue({
      ownerID: data.ownerID,
      endDate: new Date().toISOString().slice(0, 10),
    });
  }

  onEdit() {
    if (this.reportForm.valid) {
      this.downloadReport();
    }
  }

  async downloadReport() {
    const data = {
      ownerID: this.reportForm.get('ownerID')?.value,
      startDate: new Date(this.reportForm.get('startDate')?.value!).toISOString(),
      endDate: new Date(this.reportForm.get('endDate')?.value!).toISOString(),
    };
  
    try {
      const response = await this.apiService.downloadReport(data);
      // Check if response is a Blob
      if (response instanceof Blob) {
        // Create a blob URL for the PDF
        const fileURL = URL.createObjectURL(response);
        
        // Display success message
        this.close('Report downloaded successfully');
        // Open the PDF in a new tab
        window.open(fileURL);
      } else {
        // Handle non-Blob responses (e.g., error)
        this.close('Error downloading report');
      }
    } catch (error: any) {
      if(error.status === 404){
        this.close('No Records')
      }
      else{
        this.close('Error');
      }
    }
  }

  close(value: string) {
    this.modal.close(value);
  }
}