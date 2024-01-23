import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { authGuard } from './auth.guard';

export const routes: Routes = [
    {
        path: '', 
        loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule)
    },
    {
        path: 'home',
        canActivate: [authGuard],
        loadChildren: () => import('./home/home.module').then(m => m.HomeModule)
    },
    {path: '**', redirectTo: ''}
];
  
