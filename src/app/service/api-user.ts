import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { IUser } from '../models/iuser';
import { environment } from '../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class ApiUser {
  constructor(private _HttpClient: HttpClient) { }

  // إنشاء مستخدم جديد
  SignUpUser(user: IUser): Observable<IUser> {
    return this._HttpClient.post<IUser>(`${environment.UserUrl}`, user);
  }

  // جلب جميع المستخدمين (أغراض عامة)
  GetUsers(): Observable<IUser[]> {
    return this._HttpClient.get<IUser[]>(`${environment.UserUrl}`);
  }

  GetUserByUsernamePassword(username: string, password: string): Observable<IUser | null> {
    return this._HttpClient.get<IUser[]>(`${environment.UserUrl}?username=${username}&password=${password}`)
      .pipe(
        map(users => users.length ? users[0] : null)
      );
  }

  // جلب مستخدم محدد حسب id
  GetUserById(id: number): Observable<IUser> {
    return this._HttpClient.get<IUser>(`${environment.UserUrl}/${id}`);
  }

  // تحديث بيانات مستخدم
  UpdateUser(id: number, user: IUser): Observable<IUser> {
    return this._HttpClient.put<IUser>(`${environment.UserUrl}/${id}`, user);
  }

  // حذف مستخدم
  DeleteUser(id: number): Observable<void> {
    return this._HttpClient.delete<void>(`${environment.UserUrl}/${id}`);
  }
}
