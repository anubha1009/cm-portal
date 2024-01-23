import { Component } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SharedModule } from './shared/shared.module';
import { HomeModule } from './home/home.module';
import { CommonModule } from '@angular/common';
import { ToastrModule } from 'ngx-toastr';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [ ToastrModule, SharedModule, HomeModule, CommonModule, RouterModule ],
    templateUrl: './app.component.html',
    styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'cm-portal';

  constructor() {}

  ngOnInit() {
    
  }
}
