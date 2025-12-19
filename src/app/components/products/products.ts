import { Component, OnInit } from '@angular/core';
import { Iproduct } from '../../models/iproduct';
import { CommonModule } from '@angular/common';
import { UserAuth } from '../../service/user-auth';
import { Router, RouterLink } from '@angular/router';
import { ProductsService } from '../../service/products.service';
import { Observable, take } from 'rxjs';
import Swal from 'sweetalert2';
import { Title } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../service/cart.service';
import { ICartItem } from '../../models/icart';
import { IUser } from '../../models/iuser';

@Component({
  selector: 'app-products',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './products.html',
  styleUrl: './products.css',
})
export class Products implements OnInit {
  filteredProducts$: Observable<Iproduct[]>;
  categories: string[] = [];
  searchTerm: string = '';
  selectedCategory: string = '';
  isLoggedIn: boolean = false;
  private allProducts: Iproduct[] = [];

  constructor(private _ProductsService: ProductsService, private _CartService: CartService, private _UserAuth: UserAuth, private titleService: Title, private router: Router) {
    this.filteredProducts$ = this._ProductsService.filteredProducts$;
  }

  ngOnInit(): void {
    this._ProductsService.currentFilter$.subscribe(filter => {
      this.selectedCategory = filter.category;
      this.searchTerm = filter.searchTerm;
    });

    this.filteredProducts$.subscribe(products => {
      this.allProducts = products;
      this.categories = [...new Set(this._ProductsService.AllProducts.map(p => p.category))];
    });

    this._UserAuth.isLoggedIn$.subscribe(status => {
      this.isLoggedIn = status;
    });

    this.titleService.setTitle("MarketHub - Products");
  }

  filterProducts() {
    this._ProductsService.filterProducts(this.searchTerm, this.selectedCategory);
  }

  resetFilter() {
    this.searchTerm = '';
    this.selectedCategory = '';
    this._ProductsService.resetFilter();
  }

  navigateDetails(id: number) {
    this.router.navigate(['/Details', id]);
  }

  addToCart(product: Iproduct) {
    this._UserAuth.currentUser$.pipe(take(1)).subscribe(user => {
      if (!user) {
        Swal.fire('Login required', 'You must log in first!', 'warning');
        return;
      }

      const item: ICartItem = {
        productId: product.id,
        title: product.title,
        image: product.image,
        price: product.price,
        quantity: 1
      };

      const cleanUser = { id: user.id } as IUser;


      this._CartService.addProductToUserCart(cleanUser, item).subscribe({
        next: () => {
          Swal.fire({
            title: 'Adding product...',
            html: 'Please wait',
            allowOutsideClick: false,
            didOpen: () => {
              Swal.showLoading();
            }
          });

          setTimeout(() => {
            Swal.fire({
              icon: 'success',
              title: 'Added!',
              text: `${item.title} added to your cart.`,
              timer: 1500,
              showConfirmButton: false
            });
          }, 1000);
        },
        error: err => {
          console.error(err);
          Swal.fire('Error', 'Failed to add product to cart.', 'error');
        }
      });
    });
  }
}
