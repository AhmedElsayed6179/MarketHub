import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Iproduct } from '../models/iproduct';
import { ApiProducts } from './api-products';

@Injectable({
  providedIn: 'root',
})
export class ProductsService {
  private ProductService = new BehaviorSubject<Iproduct[]>([])
  Products$ = this.ProductService.asObservable()
  constructor(private _ApiProducts: ApiProducts) {
    this.loadProducts()
  }
  loadProducts() {
    this._ApiProducts.getallProducts().subscribe({
      next: (res) => this.ProductService.next(res),
      error: (err) => console.log(err)
    })
  }
}
