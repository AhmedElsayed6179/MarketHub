import { Component } from '@angular/core';
import { RouterLink } from "@angular/router";
import { UserAuth } from '../../service/user-auth';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  imports: [RouterLink, CommonModule],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class Footer {
  today = new Date();
  isLoggedIn: boolean = false
  constructor(private _UserAuth: UserAuth) {
    this._UserAuth.isLoggedIn$.subscribe(status => {
      this.isLoggedIn = status
    })
  }

  Logout() {
    this._UserAuth.Logout();
  }
}
