import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = environment.baseUrl;
  
  constructor(private http: HttpClient) { 
  }

  getAllVehicleMakes() {
    return this.http.get('https://vpic.nhtsa.dot.gov/api/vehicles/GetMakesForVehicleType/car?format=json');
  }

  decodeVin(vin: string) {
    return this.http.get('https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/' + vin + '?format=json');
  }

   ownerLogin(email: string, password: string){
    return this.http.post(this.baseUrl + '/users/login', {email, password});
  }

  adminLogin(username: string, password: string){
    return this.http.post(this.baseUrl + '/admin/login', {username, password});
  }

  changePassword(data: any){
    // add authorization header with jwt token
    let headers = {
      'Authorization': 'Bearer ' + sessionStorage.getItem('token')
    }
    return this.http.put(this.baseUrl + '/admin/change-password', data, {headers});
  }

  getVehiclesOfOwner(ownerId: string){
    // add authorization header with jwt token
    let headers = {
      'Authorization': 'Bearer ' + sessionStorage.getItem('token')
    }
    const result = this.http.get(this.baseUrl + '/vehicles/' + ownerId, {headers});
    console.log(result);
    return this.http.get(this.baseUrl + '/vehicles/' + ownerId, {headers});
  }

  getVehiclesOfOwnerWithMR(ownerId: string){
    // add authorization header with jwt token
    let headers = {
      'Authorization': 'Bearer ' + sessionStorage.getItem('token')
    }
    return this.http.get(this.baseUrl + '/vehicles/withMr/' + ownerId, {headers});
  }

  addVehicleForOwner(vehicle: any){
    // add authorization header with jwt token
    let headers = {
      'Authorization': 'Bearer ' + sessionStorage.getItem('token')
    }
    return this.http.post(this.baseUrl + '/vehicles', vehicle, {headers});
  }

  updateVehicleForOwner(vehicle: any){
    // add authorization header with jwt token
    let headers = {
      'Authorization': 'Bearer ' + sessionStorage.getItem('token')
    }
    return this.http.put(this.baseUrl + '/vehicles/'+ vehicle.vehicleID, vehicle, {headers});
  }

  deleteVehicleForOwner(vehicleId: string){
    // add authorization header with jwt token
    let headers = {
      'Authorization': 'Bearer ' + sessionStorage.getItem('token')
    }
    return this.http.delete(this.baseUrl + '/vehicles/'+ vehicleId, {headers});
  }

  getAppointmentsOfOwner(ownerId: string){
    // add authorization header with jwt token
    let headers = {
      'Authorization': 'Bearer ' + sessionStorage.getItem('token')
    }
    return this.http.get(this.baseUrl + '/appointments/' + ownerId, {headers});
  }

  async getAllProviders(){
    // add authorization header with jwt token
    let headers = {
      'Authorization': 'Bearer ' + sessionStorage.getItem('token')
    }
    return await this.http.get(this.baseUrl + '/providers', {headers}).toPromise();
  }

  addAppointmentForOwner(appointment: any){
    // add authorization header with jwt token
    let headers = {
      'Authorization': 'Bearer ' + sessionStorage.getItem('token')
    }
    return this.http.post(this.baseUrl + '/appointments', appointment, {headers});
  }

  updateAppointmentForOwner(appointment: any, appointmentID: any){
    // add authorization header with jwt token
    let headers = {
      'Authorization': 'Bearer ' + sessionStorage.getItem('token')
    }
    return this.http.put(this.baseUrl + '/appointments/'+ appointmentID, appointment, {headers});
  }

  getAppointmentsOfProvider(providerId: string){
    // add authorization header with jwt token
    let headers = {
      'Authorization': 'Bearer ' + sessionStorage.getItem('token')
    }
    return this.http.get(this.baseUrl + '/appointments/provider/' + providerId, {headers});
  }

  createMaintenanceRecord(maintenanceRecord: any){
    // add authorization header with jwt token
    let headers = {
      'Authorization': 'Bearer ' + sessionStorage.getItem('token')
    }
    return this.http.post(this.baseUrl + '/maintenanceRecords', maintenanceRecord, {headers});
  }

  addProvider(provider: any){
    // add authorization header with jwt token
    let headers = {
      'Authorization': 'Bearer ' + sessionStorage.getItem('token')
    }
    return this.http.post(this.baseUrl + '/providers', provider, {headers});
  }

  updateProvider(provider: any){
    // add authorization header with jwt token
    let headers = {
      'Authorization': 'Bearer ' + sessionStorage.getItem('token')
    }
    console.log(provider);
    return this.http.put(this.baseUrl + '/providers', provider, {headers});
  }

  deleteProvider(providerId: string){
    // add authorization header with jwt token
    let headers = {
      'Authorization': 'Bearer ' + sessionStorage.getItem('token')
    }
    console.log(providerId);
    return this.http.delete(this.baseUrl + '/providers/'+ providerId, {headers});
  }

  getAllAdmins(){
    // add authorization header with jwt token
    let headers = {
      'Authorization': 'Bearer ' + sessionStorage.getItem('token')
    }
    return this.http.get(this.baseUrl + '/admin', {headers});
  }

  addAdmin(admin: any){
    // add authorization header with jwt token
    let headers = {
      'Authorization': 'Bearer ' + sessionStorage.getItem('token')
    }
    console.log(admin);
    return this.http.post(this.baseUrl + '/admin', admin, {headers});
  }

  deleteAdmin(username: string){
    // add authorization header with jwt token
    let headers = {
      'Authorization': 'Bearer ' + sessionStorage.getItem('token')
    }
    console.log(username);
    return this.http.delete(this.baseUrl + '/admin/'+ username, {headers});
  }

  ownerSignUp(owner: any){
    return this.http.post(this.baseUrl + '/users/register', owner);
  }
}
