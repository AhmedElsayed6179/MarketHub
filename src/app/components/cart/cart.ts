import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ICartItem } from '../../models/icart';
import { CartService } from '../../service/cart.service';
import { UserAuth } from '../../service/user-auth';
import Swal from 'sweetalert2';
import { Title } from '@angular/platform-browser';
import { BehaviorSubject } from 'rxjs';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-cart',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './cart.html',
  styleUrls: ['./cart.css'],
})
export class Cart implements OnInit {
  cartItems$ = new BehaviorSubject<ICartItem[]>([]);
  userId!: number;
  username: string = '';
  totalPrice: number = 0;

  constructor(
    private _CartService: CartService,
    private _UserAuth: UserAuth,
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

  loadCart() {
    this._CartService.getUserCart(this.userId).subscribe(cart => {
      this.cartItems$.next(cart.items);
      this.updateTotals(cart.items);
    });
  }

  updateTotals(items: ICartItem[]) {
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    this.totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    this.titleService.setTitle(`Cart (${itemCount}) - ${this.username}`);
  }

  updateCart(items: ICartItem[]) {
    this._CartService.updateUserCart(this.userId, items).subscribe({
      next: () => {
        this.cartItems$.next(items);
        this.updateTotals(items);
      },
      error: err => console.error(err)
    });
  }

  increaseQuantity(item: ICartItem, items: ICartItem[]) {
    item.quantity += 1;
    this.updateCart(items);
  }

  decreaseQuantity(item: ICartItem, items: ICartItem[]) {
    if (item.quantity > 1) {
      item.quantity -= 1;
      this.updateCart(items);
    }
  }

  removeItem(item: ICartItem, items: ICartItem[]) {
    Swal.fire({
      title: 'Are you sure?',
      text: `Remove ${item.title} from cart?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No'
    }).then(result => {
      if (result.isConfirmed) {
        const updatedItems = items.filter(i => i.productId !== item.productId);
        this.updateCart(updatedItems);
        Swal.fire({
          title: 'Removed!',
          text: `${item.title} has been removed from your cart.`,
          icon: 'success',
          confirmButtonText: 'OK'
        });
      }
    });
  }

  clearCart() {
    const items = this.cartItems$.value;
    if (!items.length) return;

    Swal.fire({
      title: 'Clear Cart?',
      text: 'All items will be removed!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No'
    }).then(result => {
      if (result.isConfirmed) {
        this.updateCart([]);
        Swal.fire({
          title: 'Cleared!',
          text: 'All items have been removed from your cart.',
          icon: 'success',
          confirmButtonText: 'OK'
        });
      }
    });
  }

  getTotal(items: ICartItem[]): number {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }
}




