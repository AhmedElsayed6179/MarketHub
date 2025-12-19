import { Injectable } from '@angular/core';
import { Observable, switchMap, of, BehaviorSubject } from 'rxjs';
import { ApiCart } from './api-cart';
import { ICart, ICartItem } from '../models/icart';
import { IUser } from '../models/iuser';
import { PlaceOrder } from '../models/place-order';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private cartUpdated = new BehaviorSubject<void>(undefined);

  constructor(private _ApiCart: ApiCart) { }

  cartChanges$ = this.cartUpdated.asObservable();

  addProductToUserCart(user: IUser, item: ICartItem): Observable<ICart> {
    return this.getUserCart(user.id).pipe(
      switchMap(cart => this._ApiCart.AddtoCart(cart.id!, item)),
      switchMap(result => {
        this.cartUpdated.next();
        return of(result);
      })
    );
  }

  getUserCart(userId: number): Observable<ICart> {
    return this._ApiCart.GetCartById(userId).pipe(
      switchMap(carts => {
        if (carts.length > 0) return of(carts[0]);
        return this._ApiCart.CreateCart(userId).pipe(
          switchMap(cart => {
            this.cartUpdated.next();
            return of(cart);
          })
        );
      })
    );
  }

  updateUserCart(userId: number, items: ICartItem[]): Observable<ICart> {
    return this.getUserCart(userId).pipe(
      switchMap(cart => {
        cart.items = items;
        return this._ApiCart.updateCart(cart);
      }),
      switchMap(result => {
        this.cartUpdated.next();
        return of(result);
      })
    );
  }

  // ===== إضافة placeOrder =====
  placeOrder(order: PlaceOrder): Observable<any> {
    return this._ApiCart.placeOrder(order).pipe(
      switchMap(result => {
        return this.getUserCart(order.userId).pipe(
          switchMap(cart => {
            cart.items = [];
            return this._ApiCart.updateCart(cart);
          }),
          switchMap(() => of(result))
        );
      })
    );
  }
}
