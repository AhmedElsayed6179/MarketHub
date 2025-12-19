import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Iproduct } from '../models/iproduct';
import { ApiProducts } from './api-products';

@Injectable({
  providedIn: 'root',
})
export class ProductsService {
  public AllProducts: Iproduct[] = []
  public currentFilterSubject = new BehaviorSubject<{ searchTerm: string; category: string }>({ searchTerm: '', category: '' });
  private filteredProductsSubject = new BehaviorSubject<Iproduct[]>([])
  filteredProducts$ = this.filteredProductsSubject.asObservable()
  currentFilter$ = this.currentFilterSubject.asObservable()


  constructor(private _ApiProducts: ApiProducts) {
    this.loadProducts()
  }

  loadProducts() {
    this._ApiProducts.getallProducts().subscribe({
      next: (res) => {
        this.AllProducts = res;
        this.applyCurrentFilter();
      },
      error: (err) => console.log(err)
    })
  }

  filterProducts(searchTerm: string = '', category: string = '') {
    this.currentFilterSubject.next({ searchTerm, category });

    const filtered = this.AllProducts.filter(p => {
      const matchesName = p.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = category ? p.category === category : true;
      return matchesName && matchesCategory;
    });

    this.filteredProductsSubject.next(filtered);
  }


  applyCurrentFilter() {
    const { searchTerm, category } = this.currentFilterSubject.value;
    this.filterProducts(searchTerm, category);
  }

  getProductById(id: number) {
    return this._ApiProducts.getProductById(id);
  }

  getAllProductIds() {
    return this._ApiProducts.getAllProductIds();
  }

  resetFilter() {
    this.currentFilterSubject.next({ searchTerm: '', category: '' });
    this.filteredProductsSubject.next(this.AllProducts);
  }
}
