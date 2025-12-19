import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { IUser } from '../models/iuser';
import { UserAuth } from './user-auth';

@Injectable({
  providedIn: 'root',
})
export class UserResolver implements Resolve<IUser | null> {
  constructor(private userAuth: UserAuth) {}

  resolve(): Observable<IUser | null> {
    const currentUser = this.userAuth.currentUserValue();
    if (currentUser) return of(currentUser);

    // تشغيل loader أثناء جلب البيانات
    this.userAuth['loadingSubject'].next(true);

    return this.userAuth.loadCurrentUserFromAPI().pipe(
      tap(user => this.userAuth.setCurrentUser(user)),
      tap(() => this.userAuth['loadingSubject'].next(false)),
      catchError(() => {
        this.userAuth['loadingSubject'].next(false);
        return of(null);
      })
    );
  }
}




