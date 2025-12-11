import { Component, OnInit } from '@angular/core';
import { Iproduct } from '../../models/iproduct';
import { CommonModule } from '@angular/common';
import { UserAuth } from '../../service/user-auth';
import { Router, RouterLink } from '@angular/router';
import { ProductsService } from '../../service/products.service';
import { Observable } from 'rxjs';
import Swal from 'sweetalert2';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-products',
  imports: [CommonModule, RouterLink],
  templateUrl: './products.html',
  styleUrl: './products.css',
})
export class Products implements OnInit {
  products$: Observable<Iproduct[]>;
  isLoggedIn: boolean = false

  constructor(private _ProductsService: ProductsService, private _UserAuth: UserAuth, private _Router: Router, private titleService: Title) {
    this.products$ = this._ProductsService.Products$;
    this._UserAuth.isLoggedIn$.subscribe(status => {
      this.isLoggedIn = status
    })
    this.titleService.setTitle("MarketHub - Products")
  }

  ngOnInit(): void {
    // const stored = localStorage.getItem('products');
    // if (stored) {
    //   this.products = JSON.parse(stored);
    // }
    // this._Apiproducts.getallProducts().subscribe({
    //   next: (res) => {
    //     if (JSON.stringify(res) !== localStorage.getItem('products')) {
    //       this.products = res;
    //       localStorage.setItem('products', JSON.stringify(res));
    //     }
    //   },
    //   error: (err) => console.log(err),
    // });
  }

  BuyNow() {
    Swal.fire({
      title: 'Coming Soon!',
      text: 'This feature will be available soon. Stay tuned!',
      icon: 'info',
      confirmButtonText: 'OK'
    });
  }
}
