import { Component, OnInit } from '@angular/core';
import { RouterLink } from "@angular/router";
import { UserAuth } from '../../service/user-auth';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  imports: [RouterLink, CommonModule],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class Footer implements OnInit {
  today = new Date();
  isLoggedIn: boolean = false
  showDownloadLink = false;
  constructor(private _UserAuth: UserAuth) {
    this._UserAuth.isLoggedIn$.subscribe(status => {
      this.isLoggedIn = status
    })
  }

  ngOnInit(): void {
    const ua = navigator.userAgent || navigator.vendor || '';

    const isApk =
      /wv/i.test(ua) ||
      /Version\/[\d.]+.*Chrome/i.test(ua) ||
      /Median/i.test(ua) ||
      (window as any).cordova !== undefined ||
      (window as any).Capacitor !== undefined;

    const isMobile = /Android|iPhone|iPad|iPod|IEMobile|BlackBerry|Opera Mini/i.test(ua);

    this.showDownloadLink = isMobile && !isApk;
  }

  Logout() {
    this._UserAuth.Logout();
  }
}
