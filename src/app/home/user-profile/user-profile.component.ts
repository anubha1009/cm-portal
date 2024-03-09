import { Component } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../../api.service';
import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-user-profile',
  standalone: false,
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.css'
})
export class UserProfileComponent {

  ownerDetails: any;
  vehicleCount: number;

  changePasswordForm: FormGroup = new FormGroup({
    email: new FormControl(''),
    currentPassword: new FormControl('', Validators.required),
    newPassword: new FormControl('', Validators.required),
    confirmPassword: new FormControl('', Validators.required)
  }, { validators: this.passwordMatchValidator });

  private passwordMatchValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const newPassword = control.get('newPassword')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;
    return newPassword === confirmPassword ? null : { 'mismatch': true };
  }

  constructor(private apiService: ApiService, private authService: AuthService, private toastr: ToastrService) {
    this.vehicleCount = Number(sessionStorage.getItem('vehiclesCount')) || 0;
    this.ownerDetails = JSON.parse(sessionStorage.getItem('owner') || '{}');

    // set email
    this.changePasswordForm.get('email')?.setValue(this.ownerDetails.email);
  }

  changePassword() {
    // check if form is valid
    if (this.changePasswordForm.invalid) {
      console.log('invalid form');
      return;
    }

    let obj = {
      email: this.changePasswordForm.get('email')?.value,
      oldPassword: this.changePasswordForm.get('currentPassword')?.value,
      newPassword: this.changePasswordForm.get('newPassword')?.value
    }

    // call api
    this.apiService.changeUserPassword(obj).subscribe((res: any) => {
      this.toastr.success(res.message);
    }, (err: any) => {
      console.log(err);
      this.toastr.error(err.error.error);
    });

    // reset form except email
    this.changePasswordForm.get('currentPassword')?.reset();
    this.changePasswordForm.get('newPassword')?.reset();
    this.changePasswordForm.get('confirmPassword')?.reset();
  }

}
