import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../api.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { MatFormFieldControl } from '@angular/material/form-field';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup = new FormGroup({
      username: new FormControl('', Validators.required),
      password: new FormControl('', Validators.required),
      role: new FormControl('owner', Validators.required)
  });

  constructor(private apiService: ApiService, private toastr: ToastrService, private router: Router) { }

  ngOnInit(): void {
  }

  login(){
    if(this.loginForm.controls['username'].value.includes('@')){
      this.apiService.ownerLogin(this.loginForm.controls['username'].value, this.loginForm.controls['password'].value).subscribe((res : any)=>{
        if(res?.token){
          // set token in session storage
          sessionStorage.setItem('token', res.token);
          sessionStorage.setItem('role', 'owner');
          sessionStorage.setItem('owner', JSON.stringify(res.owner));

          this.router.navigate(['/home']);
          this.toastr.success('Login Successful');
        }
      }, (err: any)=>{
        this.toastr.error(err.error?.error);
      })
    }
    else if(this.loginForm.controls['username'].value.length && !this.loginForm.controls['username'].value.includes('@')){
      this.apiService.adminLogin(this.loginForm.controls['username'].value, this.loginForm.controls['password'].value).subscribe((res:any)=>{
        if(res?.token){
          sessionStorage.setItem('token', res.token);
          sessionStorage.setItem('role', 'admin');
          sessionStorage.setItem('admin', JSON.stringify(res.user));
          this.router.navigate(['/admin']);
          this.toastr.success('Login Successful');
        }
      }, (err: any)=>{
        this.toastr.error(err.error?.error);
      })
    }
  }

}
