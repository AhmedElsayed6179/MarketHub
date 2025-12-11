import { Component } from '@angular/core';
import { RouterLink } from "@angular/router";
import { UserAuth } from '../../service/user-auth';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  isLoggedIn: boolean = false
  username?: string | null;

  constructor(private _UserAuth: UserAuth, private titleService: Title) {
    this._UserAuth.isLoggedIn$.subscribe(status => {
      this.isLoggedIn = status
    })
    this._UserAuth.currentUsername$.subscribe(name => {
      this.username = name;
    });
    this.titleService.setTitle("MarketHub - Home")
  }

  Logout() {
    this._UserAuth.Logout();
  }
}
