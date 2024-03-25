import { animate, style, transition, trigger } from '@angular/animations';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { ApiService } from '../../../api.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from '../../../auth.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-provider-details',
  standalone: false,
  templateUrl: './provider-details.component.html',
  styleUrl: './provider-details.component.css',
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
export class ProviderDetailsComponent implements OnChanges {

  @Input() provider: any;
  @Output() close = new EventEmitter();

  updateProviderForm: FormGroup = new FormGroup({
    providerID: new FormControl(''),
    name: new FormControl('', Validators.required),
    email: new FormControl('', Validators.required),
    phone: new FormControl('', Validators.required),
    address: new FormControl('', Validators.required)
  })

  constructor(private apiService: ApiService,
    private toastr: ToastrService,
    private router: Router,
    public dialog: MatDialog,
    private authService: AuthService) { 

  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes['provider'].currentValue){
      this.provider = changes['provider'].currentValue;
      this.updateProviderForm.patchValue(this.provider);
    }

    //console.log(this.provider);
  }

  goBack() {
    this.close.emit('back');
  }

  updateProvider(){
    let provider = this.updateProviderForm.value;
    this.apiService.updateProvider(provider).subscribe((data: any) => {
      this.toastr.success(data.message);
      this.close.emit('update');
    },
    (error) => {
      this.toastr.error(error.error.error);
    });
  }

  deleteProvider() {
    this.apiService.deleteProvider(this.provider.providerID).subscribe((data: any) => {
      this.toastr.success(data.message);
      this.close.emit('delete');
    },
    (error) => {
      this.toastr.error(error.error.message);
    });
  }
}
