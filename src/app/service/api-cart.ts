import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { forkJoin, map, Observable, switchMap, take } from 'rxjs';
import { ICart, ICartItem } from '../models/icart';
import { environment } from '../environments/environment.development';
import { PlaceOrder } from '../models/place-order';

@Injectable({
  providedIn: 'root',
})
export class ApiCart {
  constructor(private _HttpClient: HttpClient) { }

  GetCartById(userId: Number): Observable<ICart[]> {
    return this._HttpClient.get<ICart[]>(`${environment.cartUrl}?userId=${userId}`)
  }

  GetAllCarts(): Observable<ICart[]> {
    return this._HttpClient.get<ICart[]>(`${environment.cartUrl}`);
  }

  CreateCart(userId: number): Observable<ICart> {
    return this.GetAllCarts().pipe(
      take(1),
      switchMap(carts => {
        const newId = carts.length > 0 ? Math.max(...carts.map(c => c.id)) + 1 : 1;
        const newCart: ICart = {
          id: newId,
          userId,
          items: []
        };
        return this._HttpClient.post<ICart>(`${environment.cartUrl}`, newCart);
      })
    );
  }

  updateCart(cart: ICart): Observable<ICart> {
    return this._HttpClient.put<ICart>(`${environment.cartUrl}/${cart.id}`, cart)
  }

  AddtoCart(cartId: number, item: ICartItem): Observable<ICart> {
    return this._HttpClient.get<ICart>(`${environment.cartUrl}/${cartId}`).pipe(
      take(1),
      switchMap((cart) => {
        const existingItem = cart.items.find(i => i.productId === item.productId)

        if (existingItem) {
          existingItem.quantity += item.quantity;
        } else {
          cart.items.push(item);
        }

        return this.updateCart(cart);
      })
    )
  }

  placeOrder(order: PlaceOrder): Observable<PlaceOrder> {
    return this._HttpClient.post<PlaceOrder>(`${environment.orderUrl}`, order);
  }

  deleteCartByUserId(userId: number): Observable<void> {
    return this.GetCartById(userId).pipe(
      take(1),
      switchMap((carts) => {
        if (carts.length === 0) {
          return new Observable<void>(observer => {
            observer.next();
            observer.complete();
          });
        }

        const deleteRequests = carts.map(cart =>
          this._HttpClient.delete(`${environment.cartUrl}/${cart.id}`)
        );

        return forkJoin(deleteRequests).pipe(map(() => void 0));
      })
    );
  }

}
