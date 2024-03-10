import { Component } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../api.service';
import { AuthService } from '../../auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-admin-profile',
  standalone: false,
  templateUrl: './admin-profile.component.html',
  styleUrl: './admin-profile.component.css'
})
export class AdminProfileComponent {
  adminDetails: any;

  changePasswordForm: FormGroup = new FormGroup({
    username: new FormControl(''),
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
    this.adminDetails = JSON.parse(sessionStorage.getItem('admin') || '{}');

    // set username
    this.changePasswordForm.get('username')?.setValue(this.adminDetails.username);
  }

  changePassword() {
    // check if form is valid
    if (this.changePasswordForm.invalid) {
      console.log('invalid form');
      return;
    }

    let obj = {
      username: this.changePasswordForm.get('username')?.value,
      oldPassword: this.changePasswordForm.get('currentPassword')?.value,
      newPassword: this.changePasswordForm.get('newPassword')?.value
    }

    // call api
    this.apiService.changePassword(obj).subscribe((res: any) => {
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
