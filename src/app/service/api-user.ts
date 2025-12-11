import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IUser } from '../models/iuser';
import { environment } from '../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class ApiUser {
  constructor(private _HttpClient: HttpClient) { }

  SignUpUser(user: IUser): Observable<IUser> {
    return this._HttpClient.post<IUser>(`${environment.UserUrl}`, user)
  }
  
  GetUsers(): Observable<IUser[]> {
    return this._HttpClient.get<IUser[]>(`${environment.UserUrl}`)
  }
}
