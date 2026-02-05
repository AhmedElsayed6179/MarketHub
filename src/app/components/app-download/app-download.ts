import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-app-download',
  imports: [],
  templateUrl: './app-download.html',
  styleUrl: './app-download.css',
})
export class AppDownload {
  constructor(private titleService: Title) {
    this.titleService.setTitle("Download Our App")
  }
}
