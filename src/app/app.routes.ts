import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { ownerGuard } from './owner.guard';
import { adminGuard } from './admin.guard';


export const routes: Routes = [
    {
        path: '', 
        loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule)
    },
    {
        path: 'home',
        canActivate: [ownerGuard],
        loadChildren: () => import('./home/home.module').then(m => m.HomeModule)
    },
    {
        path: 'admin',
        canActivate: [adminGuard],
        loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule)
    },
    {path: '**', redirectTo: ''}
];
  
