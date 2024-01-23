import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../api.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  signUpForm: FormGroup = new FormGroup({
    password: new FormControl('', Validators.required),
    email: new FormControl('', Validators.required),
    name: new FormControl('', Validators.required),
    phone: new FormControl('', Validators.required),
    address: new FormControl('', Validators.required),
  });
  constructor(private apiService: ApiService, private toastr: ToastrService, private router: Router) { }

  ngOnInit(): void {
  }

  signUp(){
    this.apiService.ownerSignUp(this.signUpForm.value).subscribe((res: any)=>{
      this.toastr.success(res.message+' Please login to continue');
      this.router.navigate(['/']);
    }, (err: any)=>{
      this.toastr.error(err.error.error);
    })
  }

  goToLogin(){
    this.router.navigate(['/']);
  }

}
