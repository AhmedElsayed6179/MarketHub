import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Iproduct } from '../models/iproduct';
import { environment } from '../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class ApiProducts {
  constructor(private _Httpclient: HttpClient) { }
  getallProducts(): Observable<Iproduct[]> {
    return this._Httpclient.get<Iproduct[]>(`${environment.baseUrl}`);
  }
}
