import { Component, Inject } from '@angular/core';
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { ApiService } from '../../api.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { AuthService } from '../../auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-admin-providers',
  standalone: false,
  templateUrl: './admin-providers.component.html',
  styleUrl: './admin-providers.component.css',
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
export class AdminProvidersComponent {

  extendedView = 'collapsed';
  providers: any = [];
  selectedProvider: any = {};

  constructor(private apiService: ApiService, public dialog: MatDialog, private toastr: ToastrService) {}

  ngOnInit(): void {
    this.getProviders();
  }

  getProviders() {
    this.apiService.getAllProviders().then((data: any) => {
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

  selectProvider(provider: any) {
    this.selectedProvider = provider;
    this.extendedView = 'expanded';
  }

  closeProviderDetails(event: any) {
    console.log(event);
    if (event === 'back') {
      this.extendedView = 'collapsed';
      this.selectedProvider = {};
    }
    if (event === 'delete' || event === 'update') {
      this.getProviders();
      this.extendedView = 'collapsed';
      this.selectedProvider = {};
    }
  }

  toggleAddProvider() {
    const dialogRef = this.dialog.open(AddProviderDialog, {
      maxWidth: '100%',
      height: 'auto',
      hasBackdrop: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.toastr.success(result);
        this.getProviders();
      }
      else{
        this.toastr.error('Provider was not added');
      }
    });
  }
}

@Component({
  selector: 'add-appointment-dialog',
  template: `
    <div class="p-4 bg-purple-500 bg-opacity-50  backdrop-blur-lg lg:backdrop-blur border-s-custom-purple-l-translucent">
      <h4
        class="display-6 text-purple-950 font-thin ms-3"
        id="modal-basic-title"
      >
        Add Provider
      </h4>
      <div class="flex w-full mt-3 gap-4 flex-col lg:flex-row">
        <div
          class="flex flex-grow-1 text-xl font-thin items-center"
        >
        <form [formGroup]="addProviderForm" class="w-full">
                <mat-form-field class="w-full">
                    <mat-label>Provider Name</mat-label>
                    <input matInput formControlName="name" placeholder="Enter Provider Name" />
                </mat-form-field>
                <mat-form-field class="w-full">
                    <mat-label>Email</mat-label>
                    <input matInput formControlName="email" placeholder="Enter Email" />
                </mat-form-field>
                <mat-form-field class="w-full">
                    <mat-label>Phone</mat-label>
                    <input matInput type="text" formControlName="phone" placeholder="Enter Phone Number" />
                </mat-form-field>
                <mat-form-field class="w-full">
                    <mat-label>Address</mat-label>
                    <input matInput formControlName="address" placeholder="Enter Address" />
                </mat-form-field>
            </form>
        </div>

        <div mat-dialog-actions class="flex flex-row lg:flex-col flex-grow-1 justify-center items-center lg:ms-auto">
          <button
            type="button"
            [disabled]="!addProviderForm.valid"
            class="bg-purple-700 text-white font-thin text-lg rounded-lg p-3 hover:bg-purple-800 w-full"
            (click)="addProvider()"
          >
            Add Provider
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
export class AddProviderDialog {
  addProviderForm = new FormGroup({
    name: new FormControl('', Validators.required),
    email: new FormControl('', Validators.required),
    phone: new FormControl('', Validators.required),
    address: new FormControl('', Validators.required)
  });

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public modal: MatDialogRef<AddProviderDialog>,
    private apiService: ApiService,
    private authService: AuthService
  ) {
  }

  addProvider() {
    let provider = this.addProviderForm.value;
    this.apiService.addProvider(provider).subscribe((data: any) => {
      this.close(data.message)
    },
    (error) => {
      this.close('')
    });
  }

  close(value: string) {
    this.modal.close(value);
  }
}
