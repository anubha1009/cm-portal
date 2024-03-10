import { Component, Inject, OnInit } from '@angular/core';
import { ApiService } from '../../api.service';
import { AuthService } from '../../auth.service';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';

@Component({
  selector: 'app-admin-dashboard',
  standalone: false,
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css',
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
export class AdminDashboardComponent implements OnInit {
  admins: any[] = [];
  selectedAdmin: any = {};
  extendedView: string = 'collapsed';
  user: any

  constructor(private apiService: ApiService, private authService: AuthService, public dialog: MatDialog, private toastr: ToastrService) {
    this.user = this.authService.getUserDetails();
  }

  ngOnInit(): void {
      this.getAdmins();
  }

  getAdmins() {
    this.apiService.getAllAdmins().subscribe((data: any) => {
      this.admins = data;
      // remove the current admin from the list
      this.admins = this.admins.filter((admin: any) => admin.username !== this.user.username);
    },
    (error) => {
      console.log(error);
    });
  }

  selectAdmin(admin: any){
    this.selectedAdmin = admin;
    const dialogRef = this.dialog.open(DeleteAdminDialog, {
      data: this.selectedAdmin,
      maxWidth: '100%',
      height: 'auto',
      hasBackdrop: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.selectedAdmin = {};
        this.toastr.success(result);
        this.getAdmins();
      }
      else{
        this.toastr.error('Admin was not deleted');
      }
    });
  }

  toggleAddAdmin(){
    const dialogRef = this.dialog.open(AddAdminDialog, {
      maxWidth: '100%',
      height: 'auto',
      hasBackdrop: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.toastr.success(result);
        this.getAdmins();
      }
      else{
        this.toastr.error('Admin was not added');
      }
    });
  }
}

@Component({
  selector: 'add-admin-dialog',
  template: `
    <div class="p-4 bg-purple-500 bg-opacity-50  backdrop-blur-lg lg:backdrop-blur border-s-custom-purple-l-translucent">
      <h4
        class="display-6 text-purple-950 font-thin ms-3"
        id="modal-basic-title"
      >
        Add Admin
      </h4>
      <div class="flex w-full mt-3 gap-4 flex-col lg:flex-row">
        <div
          class="flex flex-grow-1 text-xl font-thin items-center"
        >
        <form [formGroup]="addAdminForm" class="w-full">
                <mat-form-field class="w-full">
                    <mat-label>Admin Name</mat-label>
                    <input matInput formControlName="name" placeholder="Enter Admin Name" />
                </mat-form-field>
                <mat-form-field class="w-full">
                    <mat-label>Email</mat-label>
                    <input matInput formControlName="email" placeholder="Enter Email" />
                </mat-form-field>
                <mat-form-field class="w-full">
                    <mat-label>Username</mat-label>
                    <input matInput type="text" formControlName="username" placeholder="Enter Username" />
                </mat-form-field>
                <mat-form-field class="w-full">
                    <mat-label>Initial Password</mat-label>
                    <input matInput type="password" formControlName="password" placeholder="Enter Initial Password" />
                </mat-form-field>
            </form>
        </div>

        <div mat-dialog-actions class="flex flex-row lg:flex-col flex-grow-1 justify-center items-center lg:ms-auto">
          <button
            type="button"
            [disabled]="!addAdminForm.valid"
            class="bg-purple-700 text-white font-thin text-lg rounded-lg p-3 hover:bg-purple-800 w-full"
            (click)="addAdmin()"
          >
            Add Admin
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
export class AddAdminDialog {
  addAdminForm = new FormGroup({
    name: new FormControl('', Validators.required),
    email: new FormControl('', Validators.required),
    username: new FormControl('', Validators.required),
    password: new FormControl('', Validators.required),
    isSuperAdmin: new FormControl(false, Validators.required)
  });

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public modal: MatDialogRef<AddAdminDialog>,
    private apiService: ApiService,
    private authService: AuthService
  ) {
  }

  addAdmin() {
    let admin = this.addAdminForm.value;
    this.apiService.addAdmin(admin).subscribe((data: any) => {
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

@Component({
  selector: 'delete-admin-dialog',
  template: `
    <div class="p-4 bg-purple-500 bg-opacity-50 backdrop-blur-lg lg:backdrop-blur border-s-custom-purple-l-translucent">
      <h4
        class="display-6 text-purple-950 font-thin"
        id="modal-basic-title"
      >
        Delete Admin?
      </h4>
      <div class="flex w-full mt-3 gap-4 flex-col lg:flex-row">
        <div
          class="flex flex-grow-1 text-xl font-thin items-center text-white"
        >
          Are you sure you want to delete this admin? - {{ data?.username }}
        </div>
        <div mat-dialog-actions class="flex flex-row lg:flex-col flex-grow-1 justify-center items-center lg:ms-auto">
          <button
            type="button"
            class="bg-rose-600 text-white font-thin text-lg rounded-lg p-3 me-5 hover:bg-rose-700"
            (click)="deleteAdmin()"
          >
            Delete
          </button>
          <button
            type="button"
            class="bg-purple-700 text-white font-thin text-lg rounded-lg p-3 hover:bg-purple-800"
            (click)="close('')"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  `,
})
export class DeleteAdminDialog {
  constructor(
    public modal: MatDialogRef<DeleteAdminDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private apiService: ApiService,
    private authService: AuthService
  ) {
    console.log(data);
  }

  deleteAdmin() {
    this.apiService
      .deleteAdmin(this.data.username)
      .subscribe((response: any) => {
        if (response) {
          this.close(response.message);
        }
      }, (error) => {
        this.close('')
      });
  }

  close(value: string) {
    this.modal.close(value);
  }
}