import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from "@angular/router";
import { UserAuth } from '../../service/user-auth';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})

export class Navbar {
  IsloggedIn: boolean = false
  username?: string | null;
  constructor(private _UserAuth: UserAuth) {
    this._UserAuth.isLoggedIn$.subscribe(status => {
      this.IsloggedIn = status
    })
    this._UserAuth.currentUsername$.subscribe(name => {
      this.username = name;
    });
  }

  Logout() {
    this._UserAuth.Logout();
  }
}
