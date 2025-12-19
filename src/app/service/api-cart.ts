import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, switchMap, take } from 'rxjs';
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
}
