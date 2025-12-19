import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { UserAuth } from '../service/user-auth';
import { map, take } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class LoggedInGuard implements CanActivate {

  constructor(private _auth: UserAuth, private _router: Router) { }

  canActivate() {
    return this._auth.isLoggedIn$.pipe(
      take(1),
      map(isLoggedIn => {
        if (isLoggedIn) {
          this._router.navigate(['/Home']);
          return false;
        }
        return true;
      })
    );
  }
}
