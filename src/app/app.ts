import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Footer } from "./components/footer/footer";
import { Navbar } from './components/navbar/navbar';
import { UserAuth } from './service/user-auth';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Footer, Navbar, CommonModule],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {
  isLoading = false;

  constructor(private userAuth: UserAuth) {
    this.userAuth.loading$.subscribe(loading => {
      this.isLoading = loading;
    });
  }
}

