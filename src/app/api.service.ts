import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { retry } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = environment.baseUrl;
  unsplashUrl = 'https://api.unsplash.com/search/photos?query=';
  clientId = 'IU6aUkl8BLvPErMDWCI0G-fevl2wPkNvhB4iJrGb8B4';
  
  constructor(private http: HttpClient) { 
  }

  async downloadReport(data: any) : Promise<any> {
      let headers = {
        'Authorization': 'Bearer ' + sessionStorage.getItem('token')
      }
      const response = await this.http.post(this.baseUrl + '/reports', data, { headers, responseType: 'blob' }).toPromise();
      return response;
  }

  async getvehicleImage(query: string) : Promise<any> {
    let headers = {
      'Authorization': 'Client-ID ' + this.clientId,
      'Accept-Version': 'v1'
    }
    return await this.http.get(this.unsplashUrl + query + '&orientation=landscape', {headers}).toPromise();
  }

  decodeVin(vin: string) {
    return this.http.get('https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinExtended/' + vin + '?format=json');
  }

   ownerLogin(email: string, password: string){
    return this.http.post(this.baseUrl + '/users/login', {email, password});
  }

  changeUserPassword(data: any){
    let headers = {
      'Authorization': 'Bearer ' + sessionStorage.getItem('token')
    }
    return this.http.put(this.baseUrl + '/users/change-password', data, {headers});
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
    return this.http.get(this.baseUrl + '/vehicles/' + ownerId, {headers})
      .pipe(
        retry(3) // Retry this request up to 3 times in case of failure
      );
  }
  
  getVehiclesOfOwnerWithMR(ownerId: string){
    // add authorization header with jwt token
    let headers = {
      'Authorization': 'Bearer ' + sessionStorage.getItem('token')
    }
    return this.http.get(this.baseUrl + '/vehicles/withMr/' + ownerId, {headers})
      .pipe(
        retry(3) // Retry this request up to 3 times in case of failure
      );
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

  getMaintenanceRecordsByAppointment(appointmentId: string){
    // add authorization header with jwt token
    let headers = {
      'Authorization': 'Bearer ' + sessionStorage.getItem('token')
    }
    return this.http.get(this.baseUrl + '/maintenanceRecords/' + appointmentId, {headers});
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
    //console.log(provider);
    return this.http.put(this.baseUrl + '/providers', provider, {headers});
  }

  deleteProvider(providerId: string){
    // add authorization header with jwt token
    let headers = {
      'Authorization': 'Bearer ' + sessionStorage.getItem('token')
    }
    //console.log(providerId);
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
    //console.log(admin);
    return this.http.post(this.baseUrl + '/admin', admin, {headers});
  }

  deleteAdmin(username: string){
    // add authorization header with jwt token
    let headers = {
      'Authorization': 'Bearer ' + sessionStorage.getItem('token')
    }
    //console.log(username);
    return this.http.delete(this.baseUrl + '/admin/'+ username, {headers});
  }

  ownerSignUp(owner: any){
    return this.http.post(this.baseUrl + '/users/register', owner);
  }
}
