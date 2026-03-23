import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-terms',
  imports: [RouterLink],
  templateUrl: './terms.html',
  styleUrl: './terms.css',
})
export class Terms {
  constructor(private Title: Title) {
    this.Title.setTitle("MarketHub - Terms And Conditions")
  }
}
