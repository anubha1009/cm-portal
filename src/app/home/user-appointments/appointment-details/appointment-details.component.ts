import { animate, style, transition, trigger } from '@angular/animations';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { ApiService } from '../../../api.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from '../../../auth.service';

@Component({
  selector: 'app-appointment-details',
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

    console.log(this.appointment);
  }

  goBack(){;
    this.close.emit('back');
  }
}
