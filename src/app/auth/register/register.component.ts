import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../api.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit, AfterViewInit {
  signUpForm: FormGroup = new FormGroup({
    password: new FormControl('', Validators.required),
    email: new FormControl('', Validators.required),
    name: new FormControl('', Validators.required),
    phone: new FormControl('', Validators.required),
    address: new FormControl('', Validators.required),
  });
  @ViewChild('addressInput') addressInputRef!: ElementRef;
  constructor(private apiService: ApiService, private toastr: ToastrService, private router: Router) { }


  async ngAfterViewInit(): Promise<void> {
    const autocomplete = await google.maps.importLibrary('places') as google.maps.PlacesLibrary;
    const input = this.addressInputRef.nativeElement;
    const options = {
      componentRestrictions: { country: 'US' },
      types: ['address']  // 'establishment' / 'address' / 'geocode'
    };
    const autocompleteObj = new autocomplete.Autocomplete(input, options);
    autocompleteObj.addListener('place_changed', () => {
      const place = autocompleteObj.getPlace();
      if (place.formatted_address) {
        this.signUpForm.patchValue({
          address: place.formatted_address
        });
      }
    });
    // const autocomplete = new google.maps.places.Autocomplete(
    //   this.addressInputRef.nativeElement,
    //   {
    //     componentRestrictions: { country: 'US' },
    //     types: ['address']  // 'establishment' / 'address' / 'geocode'
    //   }
    // );
    // google.maps.event.addListener(autocomplete, 'place_changed', () => {
    //   const place = autocomplete.getPlace();
    //   //console.log(place);
    //   if (place.formatted_address) {
    //     this.signUpForm.patchValue({
    //       address: place.formatted_address
    //     });
    //   }
    // });
  }

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
