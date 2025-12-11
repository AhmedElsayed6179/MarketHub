import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root',
})

export class UserAuth {
  private AuthSubject = new BehaviorSubject<boolean>(false)
  private CurrentUserSubject = new BehaviorSubject<string | null>(null);

  isLoggedIn$ = this.AuthSubject.asObservable();
  currentUsername$ = this.CurrentUserSubject.asObservable();

  constructor(private _Router: Router) {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const userObj = JSON.parse(storedUser);
      this.AuthSubject.next(true);
      this.CurrentUserSubject.next(userObj.username);
    }
  }

  Login(username?: string) {
    this.AuthSubject.next(true)
    if (username) this.CurrentUserSubject.next(username);
  }

  Logout() {
    Swal.fire({
      title: "Success!",
      text: "Logout Successfully",
      icon: "success",
      cancelButtonText: "OK"
    })
    localStorage.removeItem("user")
    this.AuthSubject.next(false)
    this.CurrentUserSubject.next(null);
    this._Router.navigateByUrl("/Home")
  }
}
