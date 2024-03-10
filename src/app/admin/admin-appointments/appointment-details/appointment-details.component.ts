import { Component, EventEmitter, Inject, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { ApiService } from '../../../api.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { AuthService } from '../../../auth.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { animate, style, transition, trigger } from '@angular/animations';


@Component({
  selector: 'app-appointment-details-admin',
  standalone: false,
  templateUrl: './appointment-details.component.html',
  styleUrl: './appointment-details.component.css',
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
export class AppointmentDetailsComponent implements OnChanges {

  @Input() appointment: any;
  @Output() close = new EventEmitter<any>();
  maintenanceRecords: any;

  constructor(private apiService: ApiService,
    private toastr: ToastrService,
    private router: Router,
    public dialog: MatDialog,
    private authService: AuthService) { 

  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes['appointment'].currentValue){
      this.appointment = changes['appointment'].currentValue;
    }
  }

  toggleCloseAppointment(){
    console.log(this.appointment);
    const dialogRef = this.dialog.open(CloseAppointmentDialog, {
      data: this.appointment,
      maxWidth: '100%',
      height: 'auto',
      hasBackdrop: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.toastr.success(result);
        this.close.emit('update');
      }
      else{
        this.toastr.error('Appointment not updated');
      }
    });
  }

  goBack(){
    this.close.emit('back');
  }

}

@Component({
  selector: 'close-appointment-dialog',
  template: `
    <div class="p-4 bg-purple-500 bg-opacity-50  backdrop-blur-lg lg:backdrop-blur border-s-custom-purple-l-translucent">
      <h4
        class="display-6 text-purple-950 font-thin ms-3"
        id="modal-basic-title"
      >
        Close Appointment
      </h4>
      <div class="flex w-full mt-3 gap-4 flex-col lg:flex-row">
        <div
          class="flex flex-grow-1 text-xl font-thin items-center"
        >
          <form
            [formGroup]="closeAppointmentForm"
            class="w-full"
          >
            <mat-form-field class="w-full">
              <mat-label>Next Maintenance Date</mat-label>
              <input
                matInput type="date"
                [min]="today.toISOString().slice(0, 10)"
                formControlName="nextMaintenanceDate"
              />
            </mat-form-field>

            <mat-form-field class="w-full">
              <mat-label>Cost</mat-label>
              <input
                matInput
                type="text"
                formControlName="cost"
                placeholder="Cost"
              />
            </mat-form-field>

            <mat-form-field class="w-full">
              <mat-label>Mileage Recorded</mat-label>
              <input
                matInput
                type="text"
                formControlName="mileage"
                placeholder="Enter Mileage"
              />
            </mat-form-field>

            <mat-form-field class="w-full">
              <mat-label>Additional Notes</mat-label>
              <input
                matInput
                type="text"
                formControlName="notes"
                placeholder="Any Additional Notes?"
              />
            </mat-form-field>
          </form>
        </div>

        <div mat-dialog-actions class="flex flex-row lg:flex-col flex-grow-1 justify-center items-center lg:ms-auto">
          <button
            type="button"
            [disabled]="!closeAppointmentForm.valid"
            class="bg-purple-700 text-white font-thin text-lg rounded-lg p-3 hover:bg-purple-800 w-full"
            (click)="closeAppointment()"
          >
            Close Appointment
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
export class CloseAppointmentDialog {
  closeAppointmentForm = new FormGroup({
    nextMaintenanceDate: new FormControl('', [Validators.required]),
    cost: new FormControl('', [Validators.required]),
    mileage: new FormControl('', [Validators.required]),
    notes: new FormControl(''),
  });

  today: Date = new Date();

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public modal: MatDialogRef<CloseAppointmentDialog>,
    private apiService: ApiService,
    private authService: AuthService
  ) {
    this.closeAppointmentForm.setValue({
      nextMaintenanceDate: this.today.toISOString().split('T')[0],
      mileage: this.data.vehicleDetails[0].mileage,
      cost: '',
      notes: ''
    });
  }

  closeAppointment() {
    let obj = {
      vehicleID: this.data.vehicleDetails[0].vehicleID,
      date: this.today.toISOString().split('T')[0],
      type: this.data.serviceType,
      cost: this.closeAppointmentForm.value.cost,
      notes: this.closeAppointmentForm.value.notes,
      nextMaintenanceDate: this.closeAppointmentForm.value.nextMaintenanceDate,
      providerID: this.data.providerID,
      isAppointment: true,
      appointmentID: this.data.appointmentID,
      lastUpdate: new Date().toISOString(),
      mileage: this.closeAppointmentForm.value.mileage,
      mileageDate: this.today.toISOString().split('T')[0]
    }
    this.apiService.createMaintenanceRecord(obj).subscribe((res: any) => {
      this.close(res.message)
    },
    (err: any) => {
      this.close('');
    });
  }

  close(value: string) {
    this.modal.close(value);
  }
}