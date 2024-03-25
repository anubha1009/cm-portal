import { Component, EventEmitter, Inject, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { ApiService } from '../../../api.service';
import { animate, style, transition, trigger } from '@angular/animations';
import { Vehicle } from '../user-vehicles.component';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AuthService } from '../../../auth.service';
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

  constructor(private apiService: ApiService,
    private toastr: ToastrService,
    private router: Router,
    public dialog: MatDialog,
    private authService: AuthService) { 

  }
  ngOnChanges(changes: SimpleChanges): void {
    if(changes['vehicle'].currentValue){
      this.vehicle = changes['vehicle'].currentValue;
      if(this.vehicle.VIN){
        this.getVehicleDetailsByVin(this.vehicle.VIN);
      }
    }

    //console.log(this.vehicle);
  }

  goBack(){;
    this.close.emit('back');
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
      //console.log(this.vehicle);
    });
  }

  openDeleteDialog(vehicle: any) {
    const dialogRef = this.dialog.open(DeleteVehicleDialog, {
      data: vehicle,
      maxWidth: '100%',
      height: 'auto',
      hasBackdrop: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.close.emit('delete');
      }
    });
  }

  openUpdateDialog(vehicle: any) {
    const dialogRef = this.dialog.open(UpdateVehicleDialog, {
      data: vehicle,
      maxWidth: '100%',
      height: 'auto',
      hasBackdrop: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.toastr.success(result);
        this.close.emit('update');
      }
    });
  }
}


@Component({
  selector: 'delete-vehicle-dialog',
  template: `
    <div class="p-4 bg-purple-500 bg-opacity-50 backdrop-blur-lg lg:backdrop-blur border-s-custom-purple-l-translucent">
      <h4
        class="display-6 text-purple-950 font-thin"
        id="modal-basic-title"
      >
        Delete Vehicle?
      </h4>
      <div class="flex w-full mt-3 gap-4 flex-col lg:flex-row">
        <div
          class="flex flex-grow-1 text-xl font-thin items-center text-white"
        >
          Are you sure you want to delete this vehicle? - {{ data?.make }}
          {{ data?.model }} {{ data?.year }}
        </div>
        <div mat-dialog-actions class="flex flex-row lg:flex-col flex-grow-1 justify-center items-center lg:ms-auto">
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
    //console.log(data);
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
    <div class="p-4 bg-purple-500 bg-opacity-50  backdrop-blur-lg lg:backdrop-blur border-s-custom-purple-l-translucent">
      <h4
        class="display-6 text-purple-950 font-thin ms-3"
        id="modal-basic-title"
      >
        Update Vehicle?
      </h4>
      <div class="flex w-full mt-3 gap-4 flex-col lg:flex-row">
        <div
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
          </form>
        </div>

        <div mat-dialog-actions class="flex flex-row lg:flex-col flex-grow-1 justify-center items-center lg:ms-auto">
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
    //console.log(data);
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
        //console.log(response);
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
