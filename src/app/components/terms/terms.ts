import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-terms',
  imports: [],
  templateUrl: './terms.html',
  styleUrl: './terms.css',
})
export class Terms {
  constructor(private Title: Title) {
    this.Title.setTitle("MarketHub - Terms And Conditions")
  }
}
