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
        animate('500ms', style({ transform: 'translateY(-100%)' })),
      ]),
    ]),
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
        index: 1,
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

  openDeleteDialog(vehicle: any) {
    const dialogRef = this.dialog.open(DeleteVehicleDialog, {
      data: vehicle,
      width: '60%',
      height: 'auto',
      hasBackdrop: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.getVehiclesOfOwner();
      }
    });
  }

  openUpdateDialog(vehicle: any) {
    const dialogRef = this.dialog.open(UpdateVehicleDialog, {
      data: vehicle,
      width: '60%',
      height: 'auto',
      hasBackdrop: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.toastr.success(result);
        this.getVehiclesOfOwner();
      }
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

@Component({
  selector: 'delete-vehicle-dialog',
  template: `
    <div class="p-4 bg-custom-purple-l-translucent backdrop-blur border-s-custom-purple-l-translucent">
      <h4
        mat-dialog-title
        class="display-6 text-purple-950 font-thin"
        id="modal-basic-title"
      >
        Delete Vehicle?
      </h4>
      <div class="flex w-full mt-3">
        <div
          mat-dialog-content
          class="flex flex-grow-1 text-xl font-thin items-center text-blue-50"
        >
          Are you sure you want to delete this vehicle? - {{ data?.make }}
          {{ data?.model }} {{ data?.year }}
        </div>
        <div mat-dialog-actions class="flex flex-grow-1 justify-end ms-auto">
          <button
            type="button"
            class="bg-rose-600 text-white font-thin text-lg rounded-lg p-3 me-5 hover:bg-rose-700"
            (click)="deleteVehicle()"
          >
            Delete
          </button>
          <button
            type="button"
            class="bg-purple-700 text-white font-thin text-lg rounded-lg p-3 hover:bg-purple-800"
            (click)="close(false)"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  `,
})
export class DeleteVehicleDialog {
  constructor(
    public modal: MatDialogRef<DeleteVehicleDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private apiService: ApiService,
    private authService: AuthService
  ) {
    console.log(data);
  }

  deleteVehicle() {
    this.apiService
      .deleteVehicleForOwner(this.data.vehicleID)
      .subscribe((response: any) => {
        if (response) {
          this.authService.setLink('vehicles');
          this.close(true);
        }
      });
  }

  close(value: boolean) {
    this.modal.close(value);
  }
}

// Update Vehicle Dialog
@Component({
  selector: 'update-vehicle-dialog',
  template: `
    <div class="p-4 bg-custom-purple-l-translucent backdrop-blur border-s-custom-purple-l-translucent">
      <h4
        class="display-6 text-purple-950 font-thin ms-3"
        id="modal-basic-title"
      >
        Update Vehicle?
      </h4>
      <div class="flex w-full mt-3">
        <div
          mat-dialog-content
          class="flex flex-grow-1 text-xl font-thin items-center"
        >
          <form
            [formGroup]="editVehicleForm"
            class="w-full"
            (ngSubmit)="onEdit()"
          >
            <mat-form-field class="w-full">
              <mat-label>License Plate</mat-label>
              <input
                matInput
                formControlName="licensePlate"
                placeholder="Enter License Plate"
              />
            </mat-form-field>
            <mat-form-field class="w-full">
              <mat-label>State</mat-label>
              <input
                matInput
                formControlName="state"
                placeholder="Enter State"
              />
            </mat-form-field>
            <mat-form-field class="w-full">
              <mat-label>Mileage</mat-label>
              <input
                matInput
                type="number"
                formControlName="mileage"
                placeholder="Enter Mileage"
              />
            </mat-form-field>
            <!-- <button
              mat-raised-button
              color="primary"
              class="mt-3"
              type="submit"
              [disabled]="!editVehicleForm.valid"
            >
              Update Vehicle
            </button> -->
          </form>
        </div>
        <div mat-dialog-actions class="flex flex-col flex-grow-1 justify-center items-center ms-auto">
          <button
            type="button"
            [disabled]="!editVehicleForm.valid"
            class="bg-purple-700 text-white font-thin text-lg rounded-lg p-3 hover:bg-purple-800 w-full"
            (click)="updateVehicle()"
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
export class UpdateVehicleDialog {
  editVehicleForm = new FormGroup({
    vehicleID: new FormControl(''),
    licensePlate: new FormControl('', [Validators.required]),
    state: new FormControl(''),
    mileage: new FormControl('', [Validators.required]),
    mileageDate: new FormControl(new Date().toISOString().slice(0, 10)),
  });

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public modal: MatDialogRef<UpdateVehicleDialog>,
    private apiService: ApiService,
    private authService: AuthService
  ) {
    console.log(data);
    this.editVehicleForm.patchValue({
      vehicleID: data.vehicleID,
      licensePlate: data.licensePlate,
      state: data.state,
      mileage: data.mileage,
    });
  }

  onEdit() {
    if (this.editVehicleForm.valid) {
      this.updateVehicle();
    }
  }

  updateVehicle() {
    this.apiService
      .updateVehicleForOwner(this.editVehicleForm.value)
      .subscribe((response: any) => {
        console.log(response);
        if (response) {
          this.authService.setLink('vehicles');
          this.close(response.message);
        }
      });
  }

  close(value: string) {
    this.modal.close(value);
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
  maintenanceRecords?: [];
  licensePlate?: string;
  state?: string;
  mileage?: number;
  mileageDate?: string;
  vehicleID?: string;  
}
