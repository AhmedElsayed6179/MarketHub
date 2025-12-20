import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BehaviorSubject, switchMap, map } from 'rxjs';
import Swal from 'sweetalert2';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { CartService } from '../../service/cart.service';
import { UserAuth } from '../../service/user-auth';
import { ApiProducts } from '../../service/api-products';
import { ICartItem, CartViewItem } from '../../models/icart';

@Component({
  selector: 'app-cart',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './cart.html',
  styleUrls: ['./cart.css'],
})
export class Cart implements OnInit {

  cartItems$ = new BehaviorSubject<CartViewItem[]>([]);
  userId!: number;
  username = '';
  totalPrice = 0;

  constructor(
    private _CartService: CartService,
    private _UserAuth: UserAuth,
    private _ApiProducts: ApiProducts,
    private titleService: Title
  ) { }

  ngOnInit(): void {
    this._UserAuth.currentUser$.subscribe(user => {
      if (!user) return;

      this.userId = user.id;
      this.username = user.username;

      this.loadCart();
    });
  }

  // ===============================
  // تحميل الكارت (دمج cart + products)
  // ===============================
  loadCart() {
    this._CartService.getUserCart(this.userId).pipe(
      switchMap(cart =>
        this._ApiProducts.getallProducts().pipe(
          map(products =>
            cart.items.map(item => {
              const product = products.find(p => p.id === item.productId)!;
              return {
                productId: item.productId,
                title: product.title,
                image: product.image,
                price: product.price,
                quantity: item.quantity
              } as CartViewItem;
            })
          )
        )
      )
    ).subscribe(viewItems => {
      this.cartItems$.next(viewItems);
      this.updateTotals(viewItems);
    });
  }

  // ===============================
  updateTotals(items: CartViewItem[]) {
    const count = items.reduce((s, i) => s + i.quantity, 0);
    this.totalPrice = items.reduce((s, i) => s + i.price * i.quantity, 0);
    this.titleService.setTitle(`Cart (${count}) - ${this.username}`);
  }

  // ===============================
  // تحديث الكارت (تحويل View → API)
  // ===============================
  updateCart(viewItems: CartViewItem[]) {

    const apiItems: ICartItem[] = viewItems.map(i => ({
      productId: i.productId,
      quantity: i.quantity
    }));

    this._CartService.updateUserCart(this.userId, apiItems).subscribe({
      next: () => {
        this.cartItems$.next(viewItems);
        this.updateTotals(viewItems);
      },
      error: err => console.error(err)
    });
  }

  increase(item: CartViewItem) {
    item.quantity++;
    this.updateCart(this.cartItems$.value);
  }

  decrease(item: CartViewItem) {
    if (item.quantity > 1) {
      item.quantity--;
      this.updateCart(this.cartItems$.value);
    }
  }

  remove(item: CartViewItem) {
    Swal.fire({
      title: 'Remove item?',
      text: item.title,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No'
    }).then(res => {
      if (res.isConfirmed) {
        const updated = this.cartItems$.value.filter(i => i.productId !== item.productId);
        this.updateCart(updated);
        Swal.fire({
          icon: 'success',
          title: 'Removed!',
          text: `${item.title} has been removed from your cart.`,
          timer: 1500,
          showConfirmButton: false
        });
      }
    });
  }

  clearCart() {
    Swal.fire({
      title: 'Clear Cart?',
      text: 'All items will be removed!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No'
    }).then(res => {
      if (res.isConfirmed) {
        this.updateCart([]);
        Swal.fire({
          icon: 'success',
          title: 'Cleared!',
          text: 'All items have been removed from your cart.',
          timer: 1500,
          showConfirmButton: false
        });
      }
    });
  }
}
